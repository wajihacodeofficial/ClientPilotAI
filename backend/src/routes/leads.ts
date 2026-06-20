import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { geocodeLocation, queryOverpass } from '../services/osm';
import { scoreLead, generateOutreach } from '../services/openai';

const router = Router();

const DiscoverSchema = z.object({
  location: z.string(),
  categories: z.array(z.string()),
  radiusMeters: z.number().min(100).max(50000).default(5000)
});

// GET /api/leads
router.get('/', async (req, res) => {
  const user = req.user;
  
  try {
    // Get user's workspace_id from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

    // Fetch leads for this workspace
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
    res.json(leads);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/leads/discover
router.post('/discover', async (req, res) => {
  try {
    const { location, categories, radiusMeters } = DiscoverSchema.parse(req.body);
    const user = req.user;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

    // 1. Geocode
    const coords = await geocodeLocation(location);
    if (!coords) return res.status(400).json({ error: 'Could not geocode location' });

    // 2. Query OSM
    const osmNodes = await queryOverpass(coords.lat, coords.lng, radiusMeters, categories);

    // 3. Process & Insert Leads
    const newLeads = [];
    for (const node of osmNodes) {
      const category = categories.length > 0 ? categories[0] : 'retail'; // simplified
      const hasWebsite = !!node.tags?.website;
      
      const leadData = {
        workspace_id: profile.workspace_id,
        business_name: node.tags?.name || 'Unknown Business',
        category,
        address: [node.tags?.['addr:housenumber'], node.tags?.['addr:street']].filter(Boolean).join(' '),
        city: node.tags?.['addr:city'] || location.split(',')[0],
        lat: node.lat,
        lng: node.lon,
        phone: node.tags?.phone || null,
        has_website: hasWebsite,
        website_url: node.tags?.website || null,
        osm_id: node.id.toString(),
        source: 'osm',
        raw_osm_tags: node.tags
      };

      // Upsert to avoid duplicates, returning representation
      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .upsert(leadData, { onConflict: 'workspace_id,osm_id' })
        .select()
        .single();

      if (!error && inserted) {
        newLeads.push(inserted);
        
        // 4. Async trigger OpenAI scoring (do not await)
        scoreLeadAsync(inserted.id, leadData.business_name, category, leadData.address, hasWebsite).catch(console.error);
      }
    }

    res.json({ leads: newLeads, count: newLeads.length });
  } catch (err: unknown) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Bad Request' });
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
      model_used: 'gpt-5.5'
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
      model_used: 'gpt-5.5'
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
    const user = req.user;

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
