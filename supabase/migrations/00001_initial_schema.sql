-- Create custom types
CREATE TYPE pipeline_stage AS ENUM ('discovery', 'qualified', 'contacted', 'client');
CREATE TYPE outreach_status AS ENUM ('draft', 'approved', 'sent');

-- 1. Workspaces Table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policies for workspaces
CREATE POLICY "Users can view their own workspaces"
    ON workspaces FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own workspaces"
    ON workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

-- 2. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their workspace"
    ON profiles FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());


-- 3. Leads Table
CREATE TABLE leads (
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
    UNIQUE (workspace_id, osm_id)
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access leads in their workspace"
    ON leads FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- 4. Lead Scores Table
CREATE TABLE lead_scores (
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

ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

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
CREATE TABLE outreach_messages (
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

ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

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
CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    stage pipeline_stage NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access pipeline history for their leads"
    ON pipeline_stages FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_outreach_messages_modtime
    BEFORE UPDATE ON outreach_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Enable Realtime for specific tables
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table lead_scores;
