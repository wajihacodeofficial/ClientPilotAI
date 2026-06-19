import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const user = req.user;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.sub)
      .single();

    if (!profile?.workspace_id) return res.status(403).json({ error: 'No workspace found' });

    // 1. Get all leads for the workspace
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('id, created_at')
      .eq('workspace_id', profile.workspace_id);

    // 2. Get latest pipeline stage for each lead
    const { data: stages } = await supabaseAdmin
      .from('pipeline_stages')
      .select('lead_id, stage')
      .eq('workspace_id', profile.workspace_id)
      .order('changed_at', { ascending: false });

    // 3. Get all outreach messages
    const { data: outreach } = await supabaseAdmin
      .from('outreach_messages')
      .select('id, status, lead_id');

    // 4. Get all scores
    const { data: scores } = await supabaseAdmin
      .from('lead_scores')
      .select('lead_id, overall_score');

    // Calculate metrics
    const totalLeads = leads?.length || 0;
    
    // Deduplicate stages to get current stage per lead
    const currentStages = new Map<string, string>();
    stages?.forEach(s => {
      if (!currentStages.has(s.lead_id)) {
        currentStages.set(s.lead_id, s.stage);
      }
    });

    const qualifiedLeads = Array.from(currentStages.values()).filter(s => ['qualified', 'contacted', 'client'].includes(s)).length;
    const outreachSent = outreach?.filter(o => o.status === 'sent').length || 0;
    const clients = Array.from(currentStages.values()).filter(s => s === 'client').length;
    const conversionRate = totalLeads > 0 ? ((clients / totalLeads) * 100).toFixed(1) : '0';

    // Group leads by day (last 14 days)
    const leadsPerDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = leads?.filter(l => l.created_at.startsWith(dateStr)).length || 0;
      leadsPerDay.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count });
    }

    // Score distribution
    let high = 0, med = 0, low = 0;
    scores?.forEach(s => {
      if (s.overall_score >= 80) high++;
      else if (s.overall_score >= 50) med++;
      else low++;
    });

    res.json({
      totalLeads,
      qualifiedLeads,
      outreachSent,
      conversionRate,
      leadsPerDay,
      scoreBandData: [
        { band: 'High (80-100)', count: high },
        { band: 'Medium (50-79)', count: med },
        { band: 'Low (<50)', count: low }
      ],
      funnelData: [
        { stage: 'Discovery', count: totalLeads },
        { stage: 'Qualified', count: qualifiedLeads },
        { stage: 'Contacted', count: Array.from(currentStages.values()).filter(s => ['contacted', 'client'].includes(s)).length },
        { stage: 'Client', count: clients }
      ],
      recentActivity: [] // Optional: implement activity feed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
