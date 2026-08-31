import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple admin authentication check against ADMIN_PASSWORD env var
function verifyAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const querySecret = new URL(req.url).searchParams.get('secret');
  const adminPassword = process.env.ADMIN_PASSWORD || 'converge_secret_admin_2026';

  if (
    (authHeader && authHeader === `Bearer ${adminPassword}`) ||
    (querySecret && querySecret === adminPassword)
  ) {
    return true;
  }
  return false;
}

// GET / POST /api/admin/cleanup-drafts — Delete draft_log entries older than 30 days
export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('draft_log')
      .delete()
      .lt('created_at', thirtyDaysAgo)
      .select('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const deletedCount = data ? data.length : 0;
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} draft_log records older than 30 days.`,
      deletedCount,
      cutoffDate: thirtyDaysAgo,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
