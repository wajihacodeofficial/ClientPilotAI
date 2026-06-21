-- =========================================================================
-- ClientPilot AI — Consolidated Database Schema & Triggers
-- =========================================================================

-- Create custom types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pipeline_stage') THEN
        CREATE TYPE pipeline_stage AS ENUM ('discovery', 'qualified', 'contacted', 'client');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'outreach_status') THEN
        CREATE TYPE outreach_status AS ENUM ('draft', 'approved', 'sent');
    END IF;
END$$;

-- 1. Workspaces Table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policies for workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
CREATE POLICY "Users can view their own workspaces"
    ON workspaces FOR SELECT
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own workspaces" ON workspaces;
CREATE POLICY "Users can insert their own workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own workspaces" ON workspaces;
CREATE POLICY "Users can update their own workspaces"
    ON workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure the role column defaults to 'user'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- Helper function to avoid RLS infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_workspace_id(user_id uuid)
RETURNS uuid AS $$
    SELECT workspace_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON profiles;
CREATE POLICY "Users can view profiles in their workspace"
    ON profiles FOR SELECT
    USING (
        workspace_id = public.get_user_workspace_id(auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());


-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT,
    city TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    phone TEXT,
    has_website BOOLEAN DEFAULT FALSE,
    website_url TEXT,
    osm_id TEXT,
    source TEXT DEFAULT 'osm',
    raw_osm_tags JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, osm_id),
    
    -- Lead contact enrichment fields
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    contact_source TEXT,
    contact_confidence DOUBLE PRECISION,
    
    -- Outreach fields
    outreach_subject TEXT,
    outreach_body TEXT,
    outreach_status TEXT DEFAULT 'draft',
    outreach_generated_at TIMESTAMPTZ,
    outreach_approved_at TIMESTAMPTZ,
    outreach_sent_at TIMESTAMPTZ,
    
    -- Proposal fields
    proposal_content TEXT,
    proposal_status TEXT DEFAULT 'draft',
    proposal_generated_at TIMESTAMPTZ,
    proposal_approved_at TIMESTAMPTZ,
    
    -- Metadata
    last_ai_model TEXT,
    last_enrichment_run_at TIMESTAMPTZ,
    last_error TEXT,
    review_notes TEXT
);

-- Enable RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads
DROP POLICY IF EXISTS "Users can access leads in their workspace" ON leads;
CREATE POLICY "Users can access leads in their workspace"
    ON leads FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );


-- 4. Lead Scores Table
CREATE TABLE IF NOT EXISTS lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    overall_score INT,
    digital_presence_gap INT,
    category_fit INT,
    review_activity INT,
    market_density INT,
    competitor_presence INT,
    ai_reasoning TEXT,
    model_used TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lead_id)
);

-- Enable RLS on lead_scores
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

-- Policies for lead_scores
DROP POLICY IF EXISTS "Users can access scores for their leads" ON lead_scores;
CREATE POLICY "Users can access scores for their leads"
    ON lead_scores FOR ALL
    USING (
        lead_id IN (
            SELECT id FROM leads WHERE workspace_id IN (
                SELECT workspace_id FROM profiles WHERE id = auth.uid()
            )
        )
    );


-- 5. Outreach Messages Table
CREATE TABLE IF NOT EXISTS outreach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    status outreach_status DEFAULT 'draft',
    generated_by_ai BOOLEAN DEFAULT TRUE,
    variant INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on outreach_messages
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

-- Policies for outreach_messages
DROP POLICY IF EXISTS "Users can access messages for their leads" ON outreach_messages;
CREATE POLICY "Users can access messages for their leads"
    ON outreach_messages FOR ALL
    USING (
        lead_id IN (
            SELECT id FROM leads WHERE workspace_id IN (
                SELECT workspace_id FROM profiles WHERE id = auth.uid()
            )
        )
    );


-- 6. Pipeline Stages Table
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    stage pipeline_stage NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on pipeline_stages
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Policies for pipeline_stages
DROP POLICY IF EXISTS "Users can access pipeline history for their leads" ON pipeline_stages;
CREATE POLICY "Users can access pipeline history for their leads"
    ON pipeline_stages FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );


-- Helper Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_leads_modtime ON leads;
CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_outreach_messages_modtime ON outreach_messages;
CREATE TRIGGER update_outreach_messages_modtime
    BEFORE UPDATE ON outreach_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- Trigger function that handles new signups in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_workspace_id uuid;
    username text;
    user_role text;
BEGIN
    username := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    
    -- Assign 'admin' role if email matches admin email, else 'user'
    IF LOWER(new.email) = 'admin@clientpilotai.com' THEN
        user_role := 'admin';
    ELSE
        user_role := 'user';
    END IF;

    -- Create a default workspace for the new user, owner points to auth.users.id
    INSERT INTO public.workspaces (name, owner_id)
    VALUES (username || '''s Workspace', new.id)
    RETURNING id INTO new_workspace_id;

    -- Create a profile row for the user associated with the new workspace
    INSERT INTO public.profiles (id, workspace_id, role, full_name)
    VALUES (
        new.id,
        new_workspace_id,
        user_role,
        username
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to run after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Enable Realtime for specific tables (handle gracefully if publications exist or not)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add tables to the existing publication if they aren't already added
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE leads;
        EXCEPTION WHEN duplicate_object THEN
            -- do nothing if already added
        END;
        
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE lead_scores;
        EXCEPTION WHEN duplicate_object THEN
            -- do nothing if already added
        END;
    END IF;
END$$;
