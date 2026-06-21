-- Migration 00006_enrichment_columns.sql
-- Add contact, outreach, proposal, and metadata fields to leads table

ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_source TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_confidence DOUBLE PRECISION;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_subject TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_body TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_status TEXT DEFAULT 'draft';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_generated_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_approved_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_sent_at TIMESTAMPTZ;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_content TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_status TEXT DEFAULT 'draft';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_generated_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_approved_at TIMESTAMPTZ;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_ai_model TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_enrichment_run_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_notes TEXT;
