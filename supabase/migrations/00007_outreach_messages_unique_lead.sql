-- Migration 00007_outreach_messages_unique_lead.sql
-- outreach_messages had no UNIQUE constraint on lead_id.
-- ON CONFLICT upserts in /prepare and /outreach were inserting duplicates.
-- This migration deduplicates existing rows and adds the constraint.

-- Step 1: Remove duplicate rows, keeping only the most-recently created per lead
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY created_at DESC) AS rn
    FROM outreach_messages
)
DELETE FROM outreach_messages
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: Add unique constraint so ON CONFLICT (lead_id) upserts work correctly
ALTER TABLE outreach_messages
    ADD CONSTRAINT outreach_messages_lead_id_unique UNIQUE (lead_id);
