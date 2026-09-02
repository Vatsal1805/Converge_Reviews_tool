import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // 1. Check if user_id exists in the admins table
    const { data: adminRecord, error: adminErr } = await supabaseAdmin
      .from('admins')
      .select('id, name')
      .eq('user_id', userId)
      .maybeSingle();

    if (!adminErr && adminRecord) {
      return NextResponse.json({
        isAdmin: true,
        role: 'admin',
        redirect: '/admin',
        adminName: adminRecord.name,
      });
    }

    // Also check by email match if email provided (e.g. initial admin seed)
    if (email) {
      const { data: adminByEmail } = await supabaseAdmin
        .from('admins')
        .select('id, name')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (adminByEmail) {
        // Associate user_id with admin row if not already linked
        await supabaseAdmin
          .from('admins')
          .update({ user_id: userId })
          .eq('id', adminByEmail.id);

        return NextResponse.json({
          isAdmin: true,
          role: 'admin',
          redirect: '/admin',
          adminName: adminByEmail.name,
        });
      }
    }

    // 2. Client User lookup: fetch clients owned by this user
    const { data: userClients, error: clientErr } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const clientsList = userClients || [];
    const clientCount = clientsList.length;

    let redirect = '/onboarding';
    if (clientCount > 0) {
      redirect = '/dashboard';
    }

    return NextResponse.json({
      isAdmin: false,
      role: 'client',
      clientCount,
      clients: clientsList,
      canAddMore: clientCount < 2, // Enforce Max 2 limit per user account!
      redirect,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
