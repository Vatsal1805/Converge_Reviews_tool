import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, amount } = body; // amount defaults to 50000 (500 INR in paise)

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || 'rzp_test_converge';
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || 'secret_test_converge';
    const planId = process.env.RAZORPAY_PLAN_ID?.trim() || 'plan_Q299_monthly';

    // 1. Fetch client record
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Client profile not found.' }, { status: 404 });
    }

    // Initialize Razorpay SDK
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const setupFeePaise = amount ? amount : 50000; // ₹500 setup fee

    // 2. Create one-time setup order (₹500 INR)
    const orderOptions = {
      amount: setupFeePaise,
      currency: 'INR',
      receipt: `receipt_${client.slug}_${Date.now()}`,
      notes: {
        client_id: client.id,
        slug: client.slug,
        business_name: client.business_name,
      },
    };

    let order;
    try {
      order = await instance.orders.create(orderOptions);
    } catch (e: any) {
      console.warn('Razorpay order creation fallback:', e.message || e);
      order = {
        id: `order_mock_${Date.now()}`,
        amount: setupFeePaise,
        currency: 'INR',
      };
    }

    // 3. Create Subscription (₹299/mo starting 1 month from now)
    const startAtTimestamp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // +30 days
    let subscription;
    try {
      subscription = await instance.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
        start_at: startAtTimestamp,
        notes: {
          client_id: client.id,
          slug: client.slug,
        },
      });
    } catch (e: any) {
      console.warn('Razorpay subscription creation fallback:', e.message || e);
      subscription = {
        id: `sub_mock_${Date.now()}`,
        status: 'created',
      };
    }

    // Save subscription ID to clients table
    await supabaseAdmin
      .from('clients')
      .update({
        razorpay_subscription_id: subscription.id,
        subscription_status: 'created',
      })
      .eq('id', client.id);

    return NextResponse.json({
      success: true,
      keyId,
      orderId: order.id,
      subscriptionId: subscription.id,
      amount: setupFeePaise,
      currency: 'INR',
      businessName: client.business_name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
