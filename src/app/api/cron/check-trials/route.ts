import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const adminPassword = process.env.ADMIN_PASSWORD || 'converge_secret_admin_2026';

    if (!secret || secret !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized cron secret' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // 1. Expire trials where trial_ends_at < now()
    const { data: expiredClients, error: expireErr } = await supabaseAdmin
      .from('clients')
      .update({ status: 'expired' })
      .eq('status', 'trial')
      .lt('trial_ends_at', now)
      .select('id, slug, business_name');

    if (expireErr) {
      console.warn('Error expiring clients in trial:', expireErr.message);
    }

    // 2. Mark reminder_sent = true for clients whose trial ends in 48 hours
    const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const { data: reminderClients, error: reminderErr } = await supabaseAdmin
      .from('clients')
      .update({ reminder_sent: true })
      .eq('status', 'trial')
      .eq('reminder_sent', false)
      .lte('trial_ends_at', in48Hours)
      .gt('trial_ends_at', now)
      .select('id, slug, business_name, trial_ends_at');

    if (reminderErr) {
      console.warn('Error marking trial reminders:', reminderErr.message);
    }

    return NextResponse.json({
      success: true,
      timestamp: now,
      expiredCount: expiredClients?.length || 0,
      expiredClients: expiredClients || [],
      remindedCount: reminderClients?.length || 0,
      reminderClients: reminderClients || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
