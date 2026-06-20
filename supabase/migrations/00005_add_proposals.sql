-- Migration 00005_add_proposals.sql
-- Creates proposals table and sets up RLS and triggers

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'reviewed', 'replied', 'accepted', 'rejected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, lead_id)
);

-- Enable RLS on proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Policies for proposals
DROP POLICY IF EXISTS "Users can access proposals in their workspace" ON proposals;
CREATE POLICY "Users can access proposals in their workspace"
    ON proposals FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_proposals_modtime ON proposals;
CREATE TRIGGER update_proposals_modtime
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable Realtime for proposals if publication exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
        EXCEPTION WHEN duplicate_object THEN
            -- do nothing if already added
        END;
    END IF;
END$$;
