import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { discoverBusinessesByLocation, searchNearbyBusinesses, OSMGeocodingError, OSMOverpassError } from '../services/osm';
import { scoreLead, generateOutreach, generateProposal } from '../services/openai';
import { enrichLeadContact } from '../services/enrichment';


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
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

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
        geocodedLocation: { lat, lng, displayName },
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

      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .upsert(leadData, { onConflict: 'workspace_id,osm_id' })
        .select()
        .single();

      if (!error && inserted) {
        newLeads.push(inserted);
        // Async AI scoring — does not block response
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

// Helper for async scoring (fire-and-forget, does not block discovery response)
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
    if (!score) return res.status(500).json({ error: 'Scoring failed — check server logs for [AI:ScoreLead] errors' });

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
  const { id } = req.params;
  const user = req.user!;

  console.log(`[Outreach:${id}] ── Request received (user=${user.sub}) ──`);

  try {
    // ── Step 1: Resolve workspace ──────────────────────────────────────
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      console.warn(`[Outreach:${id}] No workspace found for user ${user.sub}`);
      return res.status(403).json({ success: false, error: 'No workspace found' });
    }

    // ── Step 2: Fetch lead (scoped to workspace) ───────────────────────
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*, lead_scores(*)')
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id)
      .single();

    if (leadErr || !lead) {
      console.warn(`[Outreach:${id}] Lead not found. DB error: ${leadErr?.message ?? 'not in workspace'}`);
      return res.status(404).json({ success: false, error: 'Lead not found in your workspace' });
    }

    console.log(`[Outreach:${id}] Lead loaded: "${lead.business_name}" | Category: ${lead.category}`);

    // ── Step 3: Build AI reasoning context ────────────────────────────
    const reasoning =
      (lead.lead_scores as { ai_reasoning?: string }[])?.[0]?.ai_reasoning ||
      'This business lacks a modern digital presence and would benefit from our services.';

    console.log(`[Outreach:${id}] AI reasoning snippet: "${reasoning.slice(0, 100)}"`);
    console.log(`[Outreach:${id}] → Sending outreach prompt to Gemini...`);

    // ── Step 4: Call Gemini ────────────────────────────────────────────
    const outreach = await generateOutreach(lead.business_name, lead.category, reasoning);

    if (!outreach) {
      console.error(
        `[Outreach:${id}] ❌ generateOutreach returned null. ` +
        `Check [AI:Outreach] logs above for the specific Gemini error.`
      );
      return res.status(500).json({
        success: false,
        error:
          'Outreach generation returned null — common causes: ' +
          'invalid GEMINI_API_KEY (must start with "AIza"), quota exceeded, or network error. ' +
          'Check server logs for [AI:Outreach] details.',
      });
    }

    console.log(`[Outreach:${id}] ✅ Gemini returned outreach. Subject: "${outreach.subject}"`);

    const now = new Date().toISOString();

    // ── Step 5: Persist to outreach_messages (delete + insert) ────────
    // Note: outreach_messages has no UNIQUE(lead_id) constraint in the initial
    // schema (migration 00007 adds it). Use delete+insert to avoid duplicates
    // regardless of whether the migration has been applied yet.
    await supabaseAdmin.from('outreach_messages').delete().eq('lead_id', id);

    const { data: savedMsg, error: msgErr } = await supabaseAdmin
      .from('outreach_messages')
      .insert({
        lead_id: id,
        subject: outreach.subject,
        content: outreach.body,
        status: 'draft',
        generated_by_ai: true,
        updated_at: now,
      })
      .select()
      .single();

    if (msgErr) {
      console.warn(`[Outreach:${id}] ⚠️  outreach_messages insert failed: ${msgErr.message}`);
    } else {
      console.log(`[Outreach:${id}] ✅ outreach_messages saved to Supabase (id=${savedMsg?.id})`);
    }

    // ── Step 6: Mirror subject/body into leads table ───────────────────
    const { error: leadsUpdateErr } = await supabaseAdmin
      .from('leads')
      .update({
        outreach_subject: outreach.subject,
        outreach_body: outreach.body,
        outreach_status: 'draft',
        outreach_generated_at: now,
        last_ai_model: 'gemini-2.5-flash',
        updated_at: now,
      })
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id);

    if (leadsUpdateErr) {
      console.warn(`[Outreach:${id}] ⚠️  leads table update failed: ${leadsUpdateErr.message}`);
    } else {
      console.log(`[Outreach:${id}] ✅ leads table updated with outreach fields`);
    }

    // ── Step 7: Return structured response ────────────────────────────
    console.log(`[Outreach:${id}] ── Complete. Sending success response. ──`);

    return res.json({
      success: true,
      leadId: id,
      outreachSubject: outreach.subject,
      outreachBody: outreach.body,
      followUp: outreach.follow_up,
      whatsappBody: outreach.whatsapp_body,
      model: 'gemini-2.5-flash',
      // Also return the raw DB row if the frontend needs it
      message: savedMsg ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error(`[Outreach:${id}] ❌ Unhandled exception:`, err);
    return res.status(500).json({ success: false, error: message });
  }
});

// PATCH /api/leads/:id/stage
router.patch('/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const user = req.user!;

    const { data: profile } = await supabaseAdmin.from('profiles').select('workspace_id').eq('id', user.sub).single();
    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

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

// POST /api/leads/:id/prepare — enrich contact info and auto-generate outreach + proposal
// Skips generation if both outreach and proposal already exist (unless force=true is passed)
router.post('/:id/prepare', async (req, res) => {
  const user = req.user!;
  try {
    const { id } = req.params;
    const force: boolean = req.body?.force === true;

    console.log(`[Prepare:${id}] ── Request received (force=${force}, user=${user.sub}) ──`);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    // Fetch full lead with score
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*, lead_scores(*)')
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id)
      .single();

    if (leadErr || !lead) {
      console.warn(`[Prepare:${id}] Lead not found. DB error: ${leadErr?.message}`);
      return res.status(404).json({ error: 'Lead not found in your workspace' });
    }

    console.log(`[Prepare:${id}] Lead loaded: "${lead.business_name}" | Category: ${lead.category} | Has website: ${lead.has_website}`);

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};
    let lastError: string | null = null;

    // ── Step A: Contact Enrichment ───────────────────────────────────────
    const needsEnrichment = force || !lead.last_enrichment_run_at;
    if (needsEnrichment) {
      console.log(`[Prepare:${id}] → Starting contact enrichment (website: ${lead.website_url ?? 'none'})...`);
      try {
        const rawOsmTags = (lead.raw_osm_tags as Record<string, unknown>) || {};
        const enrichment = await enrichLeadContact(lead.website_url, rawOsmTags);

        const existingSource = lead.contact_source as string | null;
        const manuallyVerified = existingSource === 'manual';
        if (!manuallyVerified) {
          if (enrichment.email) {
            updates.contact_email = enrichment.email;
            updates.contact_source = enrichment.source;
            updates.contact_confidence = enrichment.confidence;
          } else if (!lead.contact_email) {
            updates.contact_email = null;
            updates.contact_source = 'none';
            updates.contact_confidence = 0;
          }
        }
        if (enrichment.phone && !lead.contact_phone) {
          updates.contact_phone = enrichment.phone;
        }
        if (enrichment.website && !lead.website) {
          updates.website = enrichment.website;
        }
        updates.last_enrichment_run_at = now;
        console.log(`[Prepare:${id}] ✅ Enrichment done. Email: ${enrichment.email ?? 'not found'} | Source: ${enrichment.source}`);
      } catch (enrichErr) {
        lastError = enrichErr instanceof Error ? enrichErr.message : 'Enrichment failed';
        console.error(`[Prepare:${id}] ❌ Enrichment error:`, enrichErr);
      }
    } else {
      console.log(`[Prepare:${id}] Skipping enrichment — already ran at ${lead.last_enrichment_run_at}`);
    }

    // ── Step B: AI Content Generation ───────────────────────────────────
    const alreadyHasOutreach = !!lead.outreach_subject && !!lead.outreach_body;
    const alreadyHasProposal = !!lead.proposal_content;
    const needsGeneration = force || !alreadyHasOutreach || !alreadyHasProposal;

    if (needsGeneration) {
      const aiReasoning = (lead.lead_scores as { ai_reasoning?: string }[])?.[0]?.ai_reasoning
        || 'This business lacks a modern digital presence and would benefit from our services.';

      console.log(`[Prepare:${id}] ── AI Generation ──`);
      console.log(`[Prepare:${id}] Needs outreach: ${force || !alreadyHasOutreach} | Needs proposal: ${force || !alreadyHasProposal}`);
      console.log(`[Prepare:${id}] AI reasoning snippet: "${aiReasoning.slice(0, 100)}"`);

      // ── Outreach generation ──────────────────────────────────────────
      if (force || !alreadyHasOutreach) {
        console.log(`[Prepare:${id}] → Requesting outreach from Gemini...`);
        try {
          const outreach = await generateOutreach(lead.business_name, lead.category, aiReasoning);
          if (outreach) {
            updates.outreach_subject = outreach.subject;
            updates.outreach_body = outreach.body;
            updates.outreach_status = 'draft';
            updates.outreach_generated_at = now;
            updates.last_ai_model = 'gemini-2.5-flash';
            console.log(`[Prepare:${id}] ✅ Outreach generated. Subject: "${outreach.subject}"`);

            // Mirror into outreach_messages for dashboard compatibility
            const { error: omErr } = await supabaseAdmin.from('outreach_messages').upsert({
              lead_id: id,
              subject: outreach.subject,
              content: outreach.body,
              status: 'draft',
              generated_by_ai: true,
              updated_at: now,
            }, { onConflict: 'lead_id' });

            if (omErr) {
              console.warn(`[Prepare:${id}] ⚠️  outreach_messages DB write failed: ${omErr.message}`);
            } else {
              console.log(`[Prepare:${id}] ✅ outreach_messages saved to Supabase`);
            }
          } else {
            const msg = 'Outreach generation returned null — Gemini call may have failed or returned empty. Check [AI:Outreach] logs above.';
            lastError = msg;
            console.error(`[Prepare:${id}] ❌ ${msg}`);
          }
        } catch (outreachErr) {
          lastError = outreachErr instanceof Error ? outreachErr.message : 'Outreach generation threw an exception';
          console.error(`[Prepare:${id}] ❌ Outreach exception:`, outreachErr);
        }
      }

      // ── Proposal generation ──────────────────────────────────────────
      if (force || !alreadyHasProposal) {
        console.log(`[Prepare:${id}] → Requesting proposal from Gemini...`);
        try {
          const proposal = await generateProposal(
            lead.business_name,
            lead.category,
            lead.address || '',
            lead.phone || undefined,
            lead.website_url || undefined,
            (lead.lead_scores as { ai_reasoning?: string }[])?.[0]?.ai_reasoning,
            (lead.raw_osm_tags as Record<string, unknown>) || {}
          );
          if (proposal) {
            updates.proposal_content = proposal.content;
            updates.proposal_status = 'draft';
            updates.proposal_generated_at = now;
            console.log(`[Prepare:${id}] ✅ Proposal generated. Title: "${proposal.title}"`);

            // Upsert into proposals table for dashboard compatibility
            const { error: propErr } = await supabaseAdmin.from('proposals').upsert({
              lead_id: id,
              workspace_id: profile.workspace_id,
              title: proposal.title,
              content: proposal.content,
              status: 'draft',
              updated_at: now,
            }, { onConflict: 'workspace_id,lead_id' });

            if (propErr) {
              console.warn(`[Prepare:${id}] ⚠️  proposals DB write failed: ${propErr.message}`);
            } else {
              console.log(`[Prepare:${id}] ✅ proposals table saved to Supabase`);
            }
          } else {
            const msg = 'Proposal generation returned null — Gemini call may have failed. Check [AI:Proposal] logs above.';
            if (!lastError) lastError = msg;
            console.error(`[Prepare:${id}] ❌ ${msg}`);
          }
        } catch (proposalErr) {
          const msg = proposalErr instanceof Error ? proposalErr.message : 'Proposal generation threw an exception';
          if (!lastError) lastError = msg;
          console.error(`[Prepare:${id}] ❌ Proposal exception:`, proposalErr);
        }
      }

      console.log(`[Prepare:${id}] ── AI Generation complete. Final error state: ${lastError ?? 'none'} ──`);
    } else {
      console.log(`[Prepare:${id}] Skipping AI generation — content already exists. Pass force=true to regenerate.`);
    }

    if (lastError) updates.last_error = lastError;

    // ── Step C: Persist all updates ──────────────────────────────────────
    console.log(`[Prepare:${id}] Persisting ${Object.keys(updates).length} field(s) to leads table...`);

    const { data: updatedLead, error: updateErr } = await supabaseAdmin
      .from('leads')
      .update({ ...updates, updated_at: now })
      .eq('id', id)
      .select('*, lead_scores(*), outreach_messages(*)')
      .single();

    if (updateErr) {
      console.error(`[Prepare:${id}] ❌ leads DB update failed: ${updateErr.message}`);
      throw updateErr;
    }

    console.log(`[Prepare:${id}] ✅ leads table updated. Sending response.`);

    // Fetch the latest proposal record for the response
    const { data: latestProposal } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq('lead_id', id)
      .eq('workspace_id', profile.workspace_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    res.json({
      lead: updatedLead,
      proposal: latestProposal || null,
      error: lastError,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/leads/:id/send-outreach — mark outreach as sent and advance pipeline stage
router.post('/:id/send-outreach', async (req, res) => {
  const user = req.user!;
  try {
    const { id } = req.params;
    const { subject, body, recipient_email } = req.body as {
      subject?: string;
      body?: string;
      recipient_email?: string;
    };

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      outreach_status: 'sent',
      outreach_sent_at: now,
      updated_at: now,
    };

    if (subject) updates.outreach_subject = subject;
    if (body) updates.outreach_body = body;

    const { data: updatedLead, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id)
      .select()
      .single();

    if (error) throw error;

    // Update outreach_messages record as well
    await supabaseAdmin
      .from('outreach_messages')
      .update({ status: 'sent', updated_at: now })
      .eq('lead_id', id);

    // Advance pipeline stage to 'contacted'
    await supabaseAdmin.from('pipeline_stages').insert({
      lead_id: id,
      workspace_id: profile.workspace_id,
      stage: 'contacted',
      changed_by: user.sub,
    });

    res.json({
      lead: updatedLead,
      sent_to: recipient_email || null,
      sent_at: now,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/leads/:id/save-draft — save edited outreach subject/body as a draft
router.post('/:id/save-draft', async (req, res) => {
  const user = req.user!;
  try {
    const { id } = req.params;
    const { subject, body } = req.body as { subject?: string; body?: string };

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      outreach_status: 'draft',
      updated_at: now,
    };
    if (subject !== undefined) updates.outreach_subject = subject;
    if (body !== undefined) updates.outreach_body = body;

    const { data: updatedLead, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id)
      .select()
      .single();

    if (error) throw error;

    // Mirror into outreach_messages
    if (body !== undefined || subject !== undefined) {
      await supabaseAdmin.from('outreach_messages').upsert({
        lead_id: id,
        subject: subject,
        content: body,
        status: 'draft',
        updated_at: now,
      }, { onConflict: 'lead_id' });
    }

    res.json({ lead: updatedLead, saved_at: now });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

export default router;
