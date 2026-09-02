-- ========================================================
-- CONVERGE REVIEWS — SUPABASE DATABASE MIGRATION & SEED
-- ========================================================

-- 1. Create `clients` table (Multi-Tenant Configuration)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    slug TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    google_review_link TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    tone TEXT DEFAULT 'warm and reassuring',
    language TEXT DEFAULT 'English',
    accent_color TEXT DEFAULT '#9C6B1F',
    status TEXT DEFAULT 'trial', -- 'trial', 'active', 'expired'
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
    reminder_sent BOOLEAN DEFAULT false,
    razorpay_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'pending',
    setup_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for instant lookup by slug and user_id
CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Add missing columns if table already exists
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'trial';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days');
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS setup_fee_paid BOOLEAN DEFAULT false;

-- 2. Create `admins` table (Role-Based Super-Admin Access)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);

-- 3. Create `scans` table (Analytics & Conversion Funnel)
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    selected_draft_index INT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_client_id ON public.scans(client_id);

-- 4. Create `draft_log` table (Anti-Redundancy History per Client)
CREATE TABLE IF NOT EXISTS public.draft_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
    drafts JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draft_log_client_created ON public.draft_log(client_id, created_at DESC);

-- ========================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_log ENABLE ROW LEVEL SECURITY;

-- CLIENTS TABLE POLICIES:
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;
CREATE POLICY "Allow public read access to clients" 
ON public.clients FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow owner read access" ON public.clients;
CREATE POLICY "Allow owner read access"
ON public.clients FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow owner write access" ON public.clients;
CREATE POLICY "Allow owner write access"
ON public.clients FOR ALL
USING (auth.uid() = user_id);

-- ADMINS TABLE POLICIES:
DROP POLICY IF EXISTS "Allow admin user lookup" ON public.admins;
CREATE POLICY "Allow admin user lookup"
ON public.admins FOR SELECT
USING (auth.uid() = user_id);

-- Service Role Full Access Overrides
CREATE POLICY "Allow service-role full access to clients" 
ON public.clients FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service-role full access to admins" 
ON public.admins FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service-role full access to scans" 
ON public.scans FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service-role full access to draft_log" 
ON public.draft_log FOR ALL USING (auth.role() = 'service_role');

-- ========================================================
-- SEED DATA (Initial Test Clients)
-- ========================================================

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
    'https://www.google.com/maps/place/Harikrushna+Eye+hospital+%26+Dental+Clinic+%7C+Best+Eye+Care+Hospital+in+Ahmedabad+%7C+Best+Dental+Care+Hospital+in+Ahmedabad/@23.0076475,72.6603201,17z/data=!4m8!3m7!1s0x395e870025d56045:0x98ab90b24ef716af!8m2!3d23.0076475!4d72.6603201!9m1!1b1!16s%2Fg%2F11vwxq98mp!18m1!1e1', 
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
