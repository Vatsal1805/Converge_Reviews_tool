import { createClient } from '@supabase/supabase-js';

export interface ClientRecord {
  id: string;
  slug: string;
  business_name: string;
  business_type: string;
  google_review_link: string;
  keywords: string[];
  tone: string;
  language: string;
  accent_color: string;
  created_at?: string;
}

export interface ScanRecord {
  id?: string;
  client_id: string;
  star_rating?: number | null;
  selected_draft_index?: number | null;
  completed?: boolean;
  created_at?: string;
}

export interface DraftLogRecord {
  id?: string;
  client_id: string;
  star_rating: number;
  drafts: string[];
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Public client (used on frontend for SELECT queries on clients table)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin / Service-Role client (used inside Server Components & API routes only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Fallback seed clients for offline dev testing
export const SEED_CLIENTS: Record<string, ClientRecord> = {
  'test-clinic': {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    slug: 'test-clinic',
    business_name: 'Harikrushna Dental & Eye Hospital',
    business_type: 'dental and eye clinic',
    google_review_link: 'https://www.google.com/maps/place/Harikrushna+Eye+hospital+%26+Dental+Clinic+%7C+Best+Eye+Care+Hospital+in+Ahmedabad+%7C+Best+Dental+Care+Hospital+in+Ahmedabad/@23.0076475,72.6603201,17z/data=!4m8!3m7!1s0x395e870025d56045:0x98ab90b24ef716af!8m2!3d23.0076475!4d72.6603201!9m1!1b1!16s%2Fg%2F11vwxq98mp!18m1!1e1',
    keywords: ['root canal treatment', 'eye checkup', 'painless extraction', 'cataract surgery', 'friendly doctor'],
    tone: 'warm, reassuring and professional',
    language: 'English',
    accent_color: '#9C6B1F',
  },
  'gelato-bar': {
    id: 'a38b55ec-89bf-4c74-9c86-8f23f81e3a12',
    slug: 'gelato-bar',
    business_name: 'Bella Vita Artisanal Gelato',
    business_type: 'Italian gelato ice cream shop',
    google_review_link: 'https://search.google.com/local/writereview?placeid=ChIJN1t_t_wVBDkR247',
    keywords: ['authentic gelato', 'pistachio flavor', 'fresh waffle cone', 'great atmosphere'],
    tone: 'casual, enthusiastic and fun',
    language: 'English',
    accent_color: '#3F6C4C',
  },
};

/**
 * Fetch client row by URL slug from Supabase, with automatic fallback to seed data
 */
export async function getClientBySlug(slug: string): Promise<ClientRecord | null> {
  const isConfigured =
    supabaseUrl &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('placeholder');

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as ClientRecord;
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to seed data:', e);
    }
  }

  return SEED_CLIENTS[slug] || null;
}

/**
 * Log scan event securely via /api/scans endpoint (server-side service-role write)
 */
export async function logScanEvent(
  clientId: string,
  starRating?: number,
  selectedDraftIndex?: number,
  completed: boolean = false
): Promise<string | null> {
  try {
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        star_rating: starRating,
        selected_draft_index: selectedDraftIndex,
        completed,
      }),
    });

    const data = await res.json();
    if (res.ok && data.id) {
      return data.id;
    }
  } catch (e) {
    console.warn('Failed to log scan event via API:', e);
  }

  return 'mock-scan-id';
}
