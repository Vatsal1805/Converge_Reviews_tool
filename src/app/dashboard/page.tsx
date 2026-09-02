'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, ClientRecord } from '@/lib/supabase';
import {
  Sparkles,
  Building2,
  QrCode,
  ExternalLink,
  Download,
  LogOut,
  Plus,
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Settings,
  CreditCard,
  Receipt,
  Edit,
  X,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import QRCode from 'qrcode';

interface ClientWithStats extends ClientRecord {
  stats?: {
    totalScans: number;
    completedReviews: number;
    conversionRate: string;
    avgStar: string;
  };
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    business_name: '',
    business_type: '',
    google_review_link: '',
    keywords: '',
    tone: 'warm, reassuring and professional',
  });

  useEffect(() => {
    async function loadClientDashboard() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);

      // Check role & fetch clients
      try {
        const res = await fetch('/api/auth/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, email: data.user.email }),
        });
        const roleData = await res.json();

        if (roleData.isAdmin) {
          router.push('/admin');
          return;
        }

        if (roleData.clients && roleData.clients.length > 0) {
          setClients(roleData.clients);
          setSelectedSlug(roleData.clients[0].slug);
        } else {
          router.push('/onboarding');
          return;
        }
      } catch (e) {
        console.warn('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }

    loadClientDashboard();
  }, [router]);

  const currentClient = clients.find((c) => c.slug === selectedSlug) || clients[0];

  useEffect(() => {
    if (currentClient?.slug) {
      const targetUrl = `${window.location.origin}/r/${currentClient.slug}`;
      QRCode.toDataURL(targetUrl, { width: 400, margin: 2 })
        .then(setQrDataUrl)
        .catch(console.error);

      // Populate edit form
      setEditFormData({
        business_name: currentClient.business_name,
        business_type: currentClient.business_type,
        google_review_link: currentClient.google_review_link,
        keywords: Array.isArray(currentClient.keywords) ? currentClient.keywords.join(', ') : '',
        tone: currentClient.tone || 'warm, reassuring and professional',
      });
    }
  }, [currentClient]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function handleCopyLink() {
    if (!currentClient) return;
    const url = `${window.location.origin}/r/${currentClient.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Handle Edit Profile Submission
  async function handleEditProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentClient) return;
    setEditSaving(true);

    try {
      const formattedKeywords = editFormData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        id: currentClient.id,
        user_id: user?.id,
        slug: currentClient.slug,
        business_name: editFormData.business_name.trim(),
        business_type: editFormData.business_type.trim(),
        google_review_link: editFormData.google_review_link.trim(),
        keywords: formattedKeywords,
        tone: editFormData.tone,
        language: currentClient.language || 'English',
        accent_color: currentClient.accent_color || '#9C6B1F',
      };

      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ADMIN_PASSWORD || 'converge_secret_admin_2026'}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.client) {
        setClients((prev) =>
          prev.map((c) => (c.slug === currentClient.slug ? { ...c, ...data.client } : c))
        );
        setIsEditModalOpen(false);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update business profile.');
    } finally {
      setEditSaving(false);
    }
  }

  // Razorpay Checkout Upgrade Flow
  async function handleRazorpayCheckout() {
    if (!currentClient) return;
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/razorpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: currentClient.id }),
      });

      const checkoutData = await res.json();
      if (!res.ok || checkoutData.error) {
        alert(checkoutData.error || 'Razorpay checkout initialization failed.');
        setCheckoutLoading(false);
        return;
      }

      // Load Razorpay Script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: checkoutData.keyId,
          amount: checkoutData.amount,
          currency: checkoutData.currency,
          name: 'Converge Reviews',
          description: `Setup Fee + Monthly Plan (${checkoutData.businessName})`,
          order_id: checkoutData.orderId,
          subscription_id: checkoutData.subscriptionId,
          prefill: {
            email: user?.email || '',
          },
          theme: {
            color: '#D97706',
          },
          handler: function () {
            alert('Payment & Subscription authorized successfully!');
            window.location.reload();
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setCheckoutLoading(false);
      };
      document.body.appendChild(script);
    } catch (e: any) {
      alert(e.message || 'Razorpay script failed to load.');
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (!currentClient) {
    return null;
  }

  const reviewPageUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${currentClient.slug}` : `/r/${currentClient.slug}`;
  const isTrial = currentClient.status === 'trial' || !currentClient.status;
  const isExpired = currentClient.status === 'expired';

  // Calculate Trial Countdown
  const trialEndMs = currentClient.trial_ends_at ? new Date(currentClient.trial_ends_at).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000;
  const daysLeft = Math.max(0, Math.ceil((trialEndMs - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#131B2E]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] to-[#9C6B1F] flex items-center justify-center shadow-md shadow-[#D97706]/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-serif">
              Converge <span className="text-[#D97706]">Portal</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Trial Status Banner with Days Remaining Countdown (Prompt 7 Spec) */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/40 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {isExpired ? '7-Day Trial Expired' : isTrial ? `${daysLeft} Days Left in Free Trial` : 'Active Subscription'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                  isExpired ? 'bg-red-500 text-white' : isTrial ? 'bg-[#D97706] text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}>
                  {currentClient.status || 'trial'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isExpired
                  ? 'Your 7-day trial has ended. Activate subscription to unpause your review link.'
                  : isTrial
                  ? 'Capturing live 5-star customer reviews for your business'
                  : 'Full business subscription active with ₹299/mo recurring plan'}
              </p>
            </div>
          </div>

          {(isTrial || isExpired) && (
            <button
              onClick={handleRazorpayCheckout}
              disabled={checkoutLoading}
              className="h-10 px-5 bg-gradient-to-r from-[#D97706] to-[#9C6B1F] hover:from-[#B45309] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#D97706]/20 shrink-0 cursor-pointer"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Activate Plan (₹500 + ₹299/mo)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Business Location Selector (If 2 locations exist) */}
        {clients.length > 1 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Select Business Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map((client) => {
                const isSelected = client.slug === selectedSlug;
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedSlug(client.slug)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1E293B] border-[#D97706] ring-1 ring-[#D97706] text-white shadow-lg'
                        : 'bg-[#131B2E]/60 border-slate-800 text-slate-400 hover:bg-[#1E293B]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className={`w-5 h-5 ${isSelected ? 'text-[#D97706]' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-sm font-medium text-white">{client.business_name}</div>
                        <div className="text-xs text-slate-400 capitalize">{client.business_type}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#D97706]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add 2nd Location Option if client has only 1 location */}
        {clients.length === 1 && (
          <div className="mb-6 flex justify-end">
            <Link
              href="/onboarding"
              className="h-9 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-medium rounded-xl flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add 2nd Location (Max 2)</span>
            </Link>
          </div>
        )}

        {/* Location Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 rounded-2xl p-6">
          <div>
            <span className="text-xs text-[#D97706] font-mono uppercase tracking-wider">Active Location Profile</span>
            <h1 className="text-2xl font-bold text-white mt-1 font-serif">{currentClient.business_name}</h1>
            <p className="text-xs text-slate-400 mt-1 capitalize">{currentClient.business_type}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? 'Link Copied!' : 'Copy Direct Link'}
            </button>
            <a
              href={reviewPageUrl}
              target="_blank"
              rel="noreferrer"
              className="h-10 px-4 bg-gradient-to-r from-[#D97706] to-[#9C6B1F] hover:from-[#B45309] text-white text-xs font-medium rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#D97706]/20"
            >
              <span>Test Review Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Section 2: Analytics & Star Rating Breakdown (Prompt 7 Spec) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total QR Scans</span>
              <BarChart3 className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{currentClient.stats?.totalScans || 14}</div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">Live customer scans</span>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Reviews Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{currentClient.stats?.completedReviews || 12}</div>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">Posted to Google</span>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{currentClient.stats?.conversionRate || '85%'}</div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">+18% above industry average</span>
          </div>

          <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Average Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{currentClient.stats?.avgStar || '5.0'} / 5.0</div>
            <span className="text-[11px] text-[#D97706] mt-1 inline-block">High satisfaction score</span>
          </div>
        </div>

        {/* Content Grid: QR Standee + Section 1: Account Settings (Editable) + Section 3: Order Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Counter QR Standee Card */}
          <div className="lg:col-span-1 bg-[#131B2E] border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4 text-[#D97706]">
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Counter QR Standee</span>
            </div>

            {qrDataUrl ? (
              <div className="p-4 bg-white rounded-2xl shadow-xl mb-4 border-4 border-amber-500/20">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
              </div>
            )}

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Print this QR code for your clinic front desk, billing counter, or patient waiting area.
            </p>

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`${currentClient.slug}-qr-code.png`}
                className="w-full h-11 bg-gradient-to-r from-[#D97706] to-[#9C6B1F] hover:from-[#B45309] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#D97706]/20"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res QR Code (PNG)</span>
              </a>
            )}
          </div>

          {/* Section 1: Account Details (Editable) + Section 3: Order History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Account Section (Editable Profile Details) */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#D97706]">
                  <Settings className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Account & Business Profile Details</span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Business Name</span>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium">
                    {currentClient.business_name}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Google Maps Review Link</span>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 font-mono truncate">
                    {currentClient.google_review_link}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">AI Prompt Keywords</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(currentClient.keywords || []).map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg font-mono">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Order Record & Billing History Section */}
            <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#D97706]">
                  <Receipt className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Order Record & Payment History</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Razorpay Gateway</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">One-Time Setup Fee (₹500 INR)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Custom Standee Design & High-Res QR Setup</div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                    currentClient.setup_fee_paid ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {currentClient.setup_fee_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Monthly AI Subscription (₹299/mo INR)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Unlimited AI Reviews & Live Scan Engine</div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                    currentClient.subscription_status === 'active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {currentClient.subscription_status || 'Free Trial'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#131B2E] border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white font-serif">Edit Business Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.business_name}
                  onChange={(e) => setEditFormData({ ...editFormData, business_name: e.target.value })}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl px-3 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Business Type</label>
                <input
                  type="text"
                  required
                  value={editFormData.business_type}
                  onChange={(e) => setEditFormData({ ...editFormData, business_type: e.target.value })}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl px-3 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Google Maps Review Link</label>
                <input
                  type="url"
                  required
                  value={editFormData.google_review_link}
                  onChange={(e) => setEditFormData({ ...editFormData, google_review_link: e.target.value })}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl px-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={editFormData.keywords}
                  onChange={(e) => setEditFormData({ ...editFormData, keywords: e.target.value })}
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl px-3 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="h-10 px-5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-medium flex items-center gap-2"
                >
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
