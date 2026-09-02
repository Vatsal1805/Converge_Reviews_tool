import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'converge_razorpay_secret';

    // Verify webhook signature if secret is present
    if (signature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.subscription?.entity || payload.payload?.payment?.entity;

    console.log(`[Razorpay Webhook] Received Event: ${event}`, entity?.id);

    const clientId = entity?.notes?.client_id;
    const subscriptionId = entity?.subscription_id || entity?.id;

    if (event === 'subscription.authenticated' || event === 'subscription.charged') {
      // Successful subscription activation
      if (clientId) {
        await supabaseAdmin
          .from('clients')
          .update({
            status: 'active',
            subscription_status: 'active',
            setup_fee_paid: true,
            razorpay_subscription_id: subscriptionId,
          })
          .eq('id', clientId);
      } else if (subscriptionId) {
        await supabaseAdmin
          .from('clients')
          .update({
            status: 'active',
            subscription_status: 'active',
            setup_fee_paid: true,
          })
          .eq('razorpay_subscription_id', subscriptionId);
      }
    } else if (event === 'payment.captured' || event === 'payment.authorized') {
      // One-time setup fee paid
      if (clientId) {
        // If setup fee paid but subscription authentication pending
        const { data: client } = await supabaseAdmin
          .from('clients')
          .select('subscription_status')
          .eq('id', clientId)
          .single();

        const currentSubStatus = client?.subscription_status || 'pending';
        const newSubStatus = currentSubStatus === 'active' ? 'active' : 'setup_paid_sub_pending';

        await supabaseAdmin
          .from('clients')
          .update({
            setup_fee_paid: true,
            status: 'active',
            subscription_status: newSubStatus,
          })
          .eq('id', clientId);
      }
    } else if (event === 'subscription.paused' || event === 'subscription.halted') {
      if (subscriptionId) {
        await supabaseAdmin
          .from('clients')
          .update({
            subscription_status: 'paused',
          })
          .eq('razorpay_subscription_id', subscriptionId);
      }
    } else if (event === 'subscription.cancelled') {
      if (subscriptionId) {
        await supabaseAdmin
          .from('clients')
          .update({
            status: 'expired',
            subscription_status: 'cancelled',
          })
          .eq('razorpay_subscription_id', subscriptionId);
      }
    }

    return NextResponse.json({ received: true, event });
  } catch (err: any) {
    console.error('Razorpay Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
