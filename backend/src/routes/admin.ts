import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

interface AdminLeadMessage {
  id: string;
  subject: string | null;
  body: string;
  status: 'draft' | 'sent' | null;
  createdAt: string;
}

interface AdminLead {
  id: string;
  name: string;
  category: string;
  city: string;
  score: number;
  scoreBreakdown: {
    digitalPresenceGap: number;
    categoryFit: number;
    reviewActivity: number;
    marketDensity: number;
    competitorPresence: number;
  };
  aiAnalysis: string;
  pipelineStage: string;
  discoveredAt: string;
  outreachMessages: AdminLeadMessage[];
}

interface AdminUserWorkspace {
  id: string;
  name: string;
  totalLeads: number;
  leadsByStage: {
    discovery: number;
    qualified: number;
    contacted: number;
    client: number;
  };
  totalOutreachSent: number;
  leads: AdminLead[];
}

interface AdminUserResponse {
  id: string;
  email: string | undefined;
  fullName: string;
  role: string;
  createdAt: string;
  lastSignInAt: string | undefined;
  workspace: AdminUserWorkspace | null;
}

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    // 1. Get auth users
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Get profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    if (profileError) throw profileError;

    // 3. Get workspaces
    const { data: workspaces, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('*');
    if (workspaceError) throw workspaceError;

    // 4. Get all leads (to count)
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('id, workspace_id, business_name, category, city, created_at');
    if (leadsError) throw leadsError;

    // 5. Get all lead scores
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from('lead_scores')
      .select('lead_id, overall_score, digital_presence_gap, category_fit, review_activity, market_density, competitor_presence, ai_reasoning');
    if (scoresError) throw scoresError;

    // 6. Get all pipeline stages to determine current stage per lead
    const { data: stages, error: stagesError } = await supabaseAdmin
      .from('pipeline_stages')
      .select('lead_id, workspace_id, stage')
      .order('changed_at', { ascending: false });
    if (stagesError) throw stagesError;

    // 7. Get outreach messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('outreach_messages')
      .select('id, lead_id, status, subject, content, created_at');
    if (messagesError) throw messagesError;

    // Build indexing maps for fast lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p]));
    const workspaceByOwnerMap = new Map(workspaces?.map(w => [w.owner_id, w]));
    
    // Deduplicate stages to get current stage per lead
    const leadStageMap = new Map<string, string>();
    stages?.forEach(s => {
      if (!leadStageMap.has(s.lead_id)) {
        leadStageMap.set(s.lead_id, s.stage);
      }
    });

    const leadScoresMap = new Map(scores?.map(s => [s.lead_id, s]));
    const leadMessagesMap = new Map<string, any[]>();
    messages?.forEach(m => {
      const list = leadMessagesMap.get(m.lead_id) || [];
      list.push(m);
      leadMessagesMap.set(m.lead_id, list);
    });

    // Group leads by workspace
    const workspaceLeadsMap = new Map<string, AdminLead[]>();
    leads?.forEach(l => {
      const wId = l.workspace_id;
      const list = workspaceLeadsMap.get(wId) || [];
      
      const currentStage = leadStageMap.get(l.id) || 'discovery';
      const scoreObj = leadScoresMap.get(l.id);
      const msgsObj = leadMessagesMap.get(l.id) || [];
      
      list.push({
        id: l.id,
        name: l.business_name,
        category: l.category,
        city: l.city,
        score: scoreObj?.overall_score || 0,
        scoreBreakdown: scoreObj ? {
          digitalPresenceGap: scoreObj.digital_presence_gap,
          categoryFit: scoreObj.category_fit,
          reviewActivity: scoreObj.review_activity,
          marketDensity: scoreObj.market_density,
          competitorPresence: scoreObj.competitor_presence,
        } : {
          digitalPresenceGap: 0,
          categoryFit: 0,
          reviewActivity: 0,
          marketDensity: 0,
          competitorPresence: 0,
        },
        aiAnalysis: scoreObj?.ai_reasoning || 'No analysis available.',
        pipelineStage: currentStage,
        discoveredAt: l.created_at,
        outreachMessages: msgsObj.map(mo => ({
          id: mo.id,
          subject: mo.subject,
          body: mo.content,
          status: mo.status,
          createdAt: mo.created_at
        }))
      });
      workspaceLeadsMap.set(wId, list);
    });

    // Compile result list
    const result: AdminUserResponse[] = authUsers.map(u => {
      const profile = profileMap.get(u.id);
      
      const workspace = workspaces.find(w => w.id === profile?.workspace_id) || workspaceByOwnerMap.get(u.id);
      const workspaceLeads = workspace ? (workspaceLeadsMap.get(workspace.id) || []) : [];
      
      const stageCounts = { discovery: 0, qualified: 0, contacted: 0, client: 0 };
      workspaceLeads.forEach((leadItem) => {
        const stage = leadItem.pipelineStage as keyof typeof stageCounts;
        if (stage in stageCounts) {
          stageCounts[stage]++;
        }
      });

      const totalOutreachSent = workspaceLeads.reduce((acc, leadItem) => {
        return acc + leadItem.outreachMessages.filter((m) => m.status === 'sent').length;
      }, 0);

      return {
        id: u.id,
        email: u.email,
        fullName: profile?.full_name || u.user_metadata?.full_name || 'Unnamed User',
        role: profile?.role || 'user',
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
        workspace: workspace ? {
          id: workspace.id,
          name: workspace.name,
          totalLeads: workspaceLeads.length,
          leadsByStage: stageCounts,
          totalOutreachSent,
          leads: workspaceLeads
        } : null
      };
    });

    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error fetching admin users:', message);
    res.status(500).json({ error: message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'admin' && role !== 'user') {
    return res.status(400).json({ error: 'Invalid role. Must be admin or user.' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error updating role for user ${id}:`, message);
    res.status(500).json({ error: message });
  }
});

export default router;
