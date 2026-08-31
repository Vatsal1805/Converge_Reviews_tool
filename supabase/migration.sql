-- ========================================================
-- CONVERGE REVIEWS — SUPABASE DATABASE MIGRATION & SEED
-- ========================================================

-- 1. Create `clients` table (Multi-Tenant Configuration)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    google_review_link TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    tone TEXT DEFAULT 'warm and reassuring',
    language TEXT DEFAULT 'English',
    accent_color TEXT DEFAULT '#9C6B1F',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant lookup by slug
CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);

-- 2. Create `scans` table (Analytics & Conversion Funnel)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    selected_draft_index INT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for client analytics aggregation
CREATE INDEX IF NOT EXISTS idx_scans_client_id ON public.scans(client_id);

-- 3. Create `draft_log` table (Anti-Redundancy History per Client)
CREATE TABLE IF NOT EXISTS public.draft_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    drafts JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for anti-repeat lookups (client_id + created_at)
CREATE INDEX IF NOT EXISTS idx_draft_log_client_created ON public.draft_log(client_id, created_at DESC);

-- ========================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_log ENABLE ROW LEVEL SECURITY;

-- CLIENTS TABLE POLICIES:
-- Public SELECT is allowed so /r/[slug] can read business name, keywords, accent color.
-- NO public INSERT, UPDATE, or DELETE policies exist — all client edits happen server-side via service-role.
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;
CREATE POLICY "Allow public read access to clients" 
ON public.clients FOR SELECT 
USING (true);

-- SCANS TABLE POLICIES:
-- NO public policies exist — public write/read is disabled.
-- All scan logging happens server-side via /api/scans using the Supabase service-role key.
DROP POLICY IF EXISTS "Allow public select to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public insert to scans" ON public.scans;
DROP POLICY IF EXISTS "Allow public update to scans" ON public.scans;

-- DRAFT_LOG TABLE POLICIES:
-- NO public policies exist. Only service-role key accessed via /api/generate-reviews.
DROP POLICY IF EXISTS "Allow public select to draft_log" ON public.draft_log;
DROP POLICY IF EXISTS "Allow public insert to draft_log" ON public.draft_log;

-- Service Role Full Access Overrides (Internal Supabase Role)
CREATE POLICY "Allow service-role full access to clients" 
ON public.clients FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service-role full access to scans" 
ON public.scans FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service-role full access to draft_log" 
ON public.draft_log FOR ALL USING (auth.role() = 'service_role');

-- ========================================================
-- SEED DATA (Initial Test Clients)
-- ========================================================

-- Seed 1: Harikrushna Dental & Eye Hospital
INSERT INTO public.clients (
    slug, 
    business_name, 
    business_type, 
    google_review_link, 
    keywords, 
    tone, 
    language, 
    accent_color
) VALUES (
    'test-clinic', 
    'Harikrushna Dental & Eye Hospital', 
    'dental and eye clinic', 
    'https://maps.app.goo.gl/CTf7bx7m7gzEWQK69', 
    ARRAY['root canal treatment', 'eye checkup', 'painless extraction', 'cataract surgery', 'friendly doctor'], 
    'warm, reassuring and professional', 
    'English', 
    '#9C6B1F'
) ON CONFLICT (slug) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    google_review_link = EXCLUDED.google_review_link,
    keywords = EXCLUDED.keywords,
    tone = EXCLUDED.tone;

-- Seed 2: Gelato Parlor
INSERT INTO public.clients (
    slug, 
    business_name, 
    business_type, 
    google_review_link, 
    keywords, 
    tone, 
    language, 
    accent_color
) VALUES (
    'gelato-bar', 
    'Bella Vita Artisanal Gelato', 
    'Italian gelato ice cream shop', 
    'https://search.google.com/local/writereview?placeid=ChIJN1t_t_wVBDkR247', 
    ARRAY['authentic gelato', 'pistachio flavor', 'fresh waffle cone', 'great atmosphere'], 
    'casual, enthusiastic and fun', 
    'English', 
    '#3F6C4C'
) ON CONFLICT (slug) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    google_review_link = EXCLUDED.google_review_link,
    keywords = EXCLUDED.keywords,
    tone = EXCLUDED.tone;
