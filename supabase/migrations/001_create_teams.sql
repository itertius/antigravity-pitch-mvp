-- ==============================================================================
-- Antigravity Pitching Competition — Database Setup
-- Description: Creates the teams table, enables RLS with public access,
--              activates Realtime publication, and seeds initial mock data.
-- How to use: Copy and paste this script into Supabase SQL Editor and click "Run".
-- ==============================================================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    project_name TEXT DEFAULT '',
    pitcher TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pool' CHECK (status IN ('pool', 'pitching', 'completed')),
    order_num INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running script to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.teams;
DROP POLICY IF EXISTS "Allow public insert access" ON public.teams;
DROP POLICY IF EXISTS "Allow public update access" ON public.teams;
DROP POLICY IF EXISTS "Allow public delete access" ON public.teams;

-- 3. Set up RLS Policies for Anon / Authenticated Users
CREATE POLICY "Allow public read access"
ON public.teams FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public insert access"
ON public.teams FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update access"
ON public.teams FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete access"
ON public.teams FOR DELETE
TO anon, authenticated
USING (true);

-- 4. Enable Supabase Realtime for instant queue sync across screens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;
END $$;

-- 5. Seed Initial Mock Teams for Antigravity Event
INSERT INTO public.teams (name, project_name, pitcher, status, order_num)
VALUES
    ('QuantumLeap', 'AI Agent for Sustainable Energy Grid', 'ธนกฤต วิทยานันท์', 'pool', 0),
    ('NeuralCraft', 'Autonomous Code Review & Refactoring Bot', 'ชลธิชา สิทธิผล', 'pool', 0),
    ('GravityZero', 'Decentralized Micro-Logistics Network', 'กฤษณะ วงศ์วัฒนา', 'pool', 0),
    ('BioPulse', 'Real-time Vital Telemetry with Wearables', 'ณภัทร ประเสริฐสุข', 'pool', 0),
    ('CyberShield', 'Zero-Trust Identity Verification API', 'ภานุพงศ์ เจริญกิจ', 'pool', 0),
    ('FinFlow', 'Automated Invoice Matching for SMEs', 'วริศรา เกษมสุข', 'pool', 0),
    ('SkySight', 'Drone Computer Vision for Crop Health', 'อานนท์ ฤทธิ์เดช', 'pool', 0),
    ('EduVibe', 'Personalized Adaptive Learning for K-12', 'มนัสวี โชติกา', 'pool', 0)
ON CONFLICT DO NOTHING;
