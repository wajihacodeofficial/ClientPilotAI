import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { discoverBusinessesByLocation, searchNearbyBusinesses, OSMGeocodingError, OSMOverpassError } from '../services/osm';
import { scoreLead, generateOutreach } from '../services/openai';

const router = Router();

const DiscoverSchema = z.object({
  location: z.string().trim().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  categories: z.array(z.string()).default([]),
  radiusMeters: z.coerce.number().min(100).max(50000).default(5000)
});

const inferLeadCategory = (requestedCategories: string[], osmCategory: string, osmType: string) => {
  if (requestedCategories.length > 0) return requestedCategories[0];
  if (osmType === 'shop') return 'retail';
  if (['restaurant', 'fast_food'].includes(osmCategory)) return 'restaurant';
  if (osmCategory === 'cafe') return 'cafe';
  if (['clinic', 'doctors', 'dentist', 'pharmacy'].includes(osmCategory)) return 'clinic';
  if (['fitness_centre', 'sports_centre', 'gym'].includes(osmCategory)) return 'gym';
  return osmCategory || 'business';
};

// GET /api/leads
router.get('/', async (req, res) => {
  const user = req.user!;
  
  try {
    // Get user's workspace_id from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

    // Fetch real leads for this workspace. Pipeline stage is stored as
    // append-only history in pipeline_stages, so we merge the latest stage
    // into each lead before returning it to the frontend.
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select(`
        *,
        lead_scores (*),
        outreach_messages (*)
      `)
      .eq('workspace_id', profile.workspace_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const leadIds = (leads || []).map((lead) => lead.id);
    let latestStageByLeadId = new Map<string, string>();

    if (leadIds.length > 0) {
      const { data: stageHistory, error: stageError } = await supabaseAdmin
        .from('pipeline_stages')
        .select('lead_id, stage, changed_at')
        .eq('workspace_id', profile.workspace_id)
        .in('lead_id', leadIds)
        .order('changed_at', { ascending: false });

      if (stageError) throw stageError;

      latestStageByLeadId = new Map<string, string>();
      for (const stageRow of stageHistory || []) {
        if (!latestStageByLeadId.has(stageRow.lead_id)) {
          latestStageByLeadId.set(stageRow.lead_id, stageRow.stage);
        }
      }
    }

    const leadsWithPipelineStage = (leads || []).map((lead) => ({
      ...lead,
      pipeline_stage: latestStageByLeadId.get(lead.id) || 'discovery',
    }));

    res.json(leadsWithPipelineStage);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/leads/discover
router.post('/discover', async (req, res) => {
  try {
    const { location, lat, lng, categories, radiusMeters } = DiscoverSchema.parse(req.body);
    const user = req.user!;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

    // 1. Skip geocoding if lat/lng are provided, else query Nominatim
    let discovery;
    if (lat !== undefined && lng !== undefined) {
      const result = await searchNearbyBusinesses({
        lat,
        lng,
        radiusMeters,
        categories,
        limit: 100,
      });
      const displayName = location || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      discovery = {
        ...result,
        geocodedLocation: {
          lat,
          lng,
          displayName,
        }
      };
    } else if (location) {
      discovery = await discoverBusinessesByLocation({
        location,
        categories,
        radiusMeters,
        limit: 100,
      });
    } else {
      return res.status(400).json({ error: 'Either location or coordinates (lat, lng) are required' });
    }

    if (discovery.businesses.length === 0) {
      return res.json({
        leads: [],
        count: 0,
        message: 'No businesses found for this location and filter.',
        geocodedLocation: discovery.geocodedLocation,
        radiusMeters: discovery.radiusMeters,
        categories: discovery.categories,
      });
    }

    // 4. Process & Insert Leads
    const newLeads = [];
    for (const business of discovery.businesses) {
      const category = inferLeadCategory(categories, business.category, business.type);
      const hasWebsite = !!business.website;
      const address = business.address || [business.area, business.city].filter(Boolean).join(', ') || discovery.geocodedLocation.displayName;
      const city = business.city || business.area || (location ? location.split(',')[0]?.trim() : '') || discovery.geocodedLocation.displayName;
      
      const leadData = {
        workspace_id: profile.workspace_id,
        business_name: business.name,
        category,
        address,
        city,
        lat: business.latitude,
        lng: business.longitude,
        phone: business.phone || null,
        has_website: hasWebsite,
        website_url: business.website || null,
        osm_id: business.osmId,
        source: 'osm',
        raw_osm_tags: {
          ...business.rawTags,
          osm_type: business.osmType,
          osm_category: business.category,
          osm_business_type: business.type,
        }
      };

      // Upsert to avoid duplicates, returning representation
      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .upsert(leadData, { onConflict: 'workspace_id,osm_id' })
        .select()
        .single();

      if (!error && inserted) {
        newLeads.push(inserted);
        
        // 5. Async trigger OpenAI scoring (do not await)
        scoreLeadAsync(inserted.id, leadData.business_name, category, leadData.address, hasWebsite).catch(console.error);
      }
    }

    res.json({
      leads: newLeads,
      count: newLeads.length,
      geocodedLocation: discovery.geocodedLocation,
      radiusMeters: discovery.radiusMeters,
      categories: discovery.categories,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid discovery request', details: err.issues });
    }
    if (err instanceof OSMGeocodingError || err instanceof OSMOverpassError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// Helper for async scoring
async function scoreLeadAsync(leadId: string, name: string, category: string, address: string, hasWebsite: boolean) {
  const score = await scoreLead(name, category, address, hasWebsite);
  if (score) {
    await supabaseAdmin.from('lead_scores').upsert({
      lead_id: leadId,
      overall_score: score.overall_score,
      digital_presence_gap: score.digital_presence_gap,
      category_fit: score.category_fit,
      review_activity: score.review_activity,
      market_density: score.market_density,
      competitor_presence: score.competitor_presence,
      ai_reasoning: score.ai_reasoning,
      model_used: 'gemini-2.5-flash'
    }, { onConflict: 'lead_id' });
  }
}

// POST /api/leads/:id/score
router.post('/:id/score', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', id).single();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const score = await scoreLead(lead.business_name, lead.category, lead.address || '', lead.has_website);
    if (!score) return res.status(500).json({ error: 'Scoring failed' });

    const { data: updated } = await supabaseAdmin.from('lead_scores').upsert({
      lead_id: id,
      ...score,
      model_used: 'gemini-2.5-flash'
    }, { onConflict: 'lead_id' }).select().single();

    res.json(updated);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/leads/:id/outreach
router.post('/:id/outreach', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lead } = await supabaseAdmin.from('leads').select('*, lead_scores(*)').eq('id', id).single();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const reasoning = lead.lead_scores?.[0]?.ai_reasoning || 'They lack a digital presence.';
    const outreach = await generateOutreach(lead.business_name, lead.category, reasoning);
    
    if (!outreach) return res.status(500).json({ error: 'Generation failed' });

    const { data: saved } = await supabaseAdmin.from('outreach_messages').insert({
      lead_id: id,
      subject: outreach.subject,
      content: outreach.body,
      status: 'draft',
      generated_by_ai: true
    }).select().single();

    res.json(saved);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// PATCH /api/leads/:id/stage
router.patch('/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body; // e.g. 'contacted'
    const user = req.user!;

    const { data: profile } = await supabaseAdmin.from('profiles').select('workspace_id').eq('id', user.sub).single();
    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    // Insert pipeline history
    const { data: history, error } = await supabaseAdmin.from('pipeline_stages').insert({
      lead_id: id,
      workspace_id: profile.workspace_id,
      stage,
      changed_by: user.sub
    }).select().single();

    if (error) throw error;
    res.json(history);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

export default router;
