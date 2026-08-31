import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/scans — Secure server-side scan logging using Service Role Key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, star_rating, selected_draft_index, completed } = body;

    if (!client_id) {
      return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('scans')
      .insert([
        {
          client_id,
          star_rating: star_rating ?? null,
          selected_draft_index: selected_draft_index ?? null,
          completed: completed ?? false,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.warn('Scan log insert warning:', error.message);
      return NextResponse.json({ id: `mock-scan-${Date.now()}` });
    }

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    return NextResponse.json({ id: `mock-scan-${Date.now()}` });
  }
}
