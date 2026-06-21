import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { generateProposal } from '../services/openai';

const router = Router();

const SaveProposalSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().trim().min(1, 'Title is required'),
  content: z.string().trim().min(1, 'Content is required'),
  status: z.enum(['draft', 'submitted', 'reviewed', 'replied', 'accepted', 'rejected']).default('draft'),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['draft', 'submitted', 'reviewed', 'replied', 'accepted', 'rejected']),
});

// GET /api/proposals - List all proposals for the user's workspace
router.get('/', async (req, res) => {
  const user = req.user!;
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const { data: proposals, error } = await supabaseAdmin
      .from('proposals')
      .select(`
        *,
        leads (
          business_name,
          category,
          address,
          city
        )
      `)
      .eq('workspace_id', profile.workspace_id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json(proposals);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// GET /api/proposals/:id - Get specific proposal details
router.get('/:id', async (req, res) => {
  const user = req.user!;
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const { data: proposal, error } = await supabaseAdmin
      .from('proposals')
      .select(`
        *,
        leads (
          business_name,
          category,
          address,
          city
        )
      `)
      .eq('id', req.params.id)
      .eq('workspace_id', profile.workspace_id)
      .single();

    if (error || !proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/proposals/generate - AI proposal generation for a lead
router.post('/generate', async (req, res) => {
  const user = req.user!;
  try {
    const { leadId } = req.body;
    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required' });
    }

    // Get profile workspace
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    // Fetch lead details and lead score details
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*, lead_scores(*)')
      .eq('id', leadId)
      .eq('workspace_id', profile.workspace_id)
      .single();

    if (leadErr || !lead) {
      return res.status(404).json({ error: 'Lead not found in your workspace' });
    }

    const aiAnalysisText = lead.lead_scores?.[0]?.ai_reasoning || 'Lacks professional digital presence.';
    const rawTags = (lead.raw_osm_tags as Record<string, unknown>) || {};

    const proposal = await generateProposal(
      lead.business_name,
      lead.category,
      lead.address || '',
      lead.phone || undefined,
      lead.website_url || undefined,
      aiAnalysisText,
      rawTags
    );

    if (!proposal) {
      return res.status(500).json({ error: 'Failed to generate proposal via AI' });
    }

    res.json(proposal);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// POST /api/proposals - Save or upsert a proposal
router.post('/', async (req, res) => {
  const user = req.user!;
  try {
    const { leadId, title, content, status } = SaveProposalSchema.parse(req.body);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    // Upsert proposal (unique on workspace_id, lead_id)
    const proposalData = {
      workspace_id: profile.workspace_id,
      lead_id: leadId,
      title,
      content,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabaseAdmin
      .from('proposals')
      .upsert(proposalData, { onConflict: 'workspace_id,lead_id' })
      .select(`
        *,
        leads (
          business_name,
          category,
          address,
          city
        )
      `)
      .single();

    if (error) throw error;
    res.json(saved);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid proposal data', details: err.issues });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// PATCH /api/proposals/:id/status - Update proposal stage/status
router.patch('/:id/status', async (req, res) => {
  const user = req.user!;
  try {
    const { id } = req.params;
    const { status } = UpdateStatusSchema.parse(req.body);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('proposals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid status', details: err.issues });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

// DELETE /api/proposals/:id - Delete a proposal
router.delete('/:id', async (req, res) => {
  const user = req.user!;
  try {
    const { id } = req.params;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) {
      return res.status(403).json({ error: 'No workspace found' });
    }

    const { error } = await supabaseAdmin
      .from('proposals')
      .delete()
      .eq('id', id)
      .eq('workspace_id', profile.workspace_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal Server Error' });
  }
});

export default router;
