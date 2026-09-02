'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Sparkles, Building2, MapPin, Phone, Link2, Key, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canAddMore, setCanAddMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [slug, setSlug] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUserId(data.user.id);

      // Check current user client count via API
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

        if (roleData.canAddMore === false) {
          setCanAddMore(false);
        }
      } catch (e) {
        console.warn('Error checking role:', e);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Auto-generate slug from business name
  function handleNameChange(val: string) {
    setBusinessName(val);
    if (!slug || slug === slugify(businessName)) {
      setSlug(slugify(val));
    }
  }

  function slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName || !businessType || !googleReviewLink || !slug) {
      setError('Please fill in all required business details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formattedKeywords = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        user_id: userId,
        slug: slug.toLowerCase().trim(),
        business_name: businessName.trim(),
        business_type: businessType.trim(),
        google_review_link: googleReviewLink.trim(),
        keywords: formattedKeywords,
        tone: 'warm, reassuring and professional',
        language: 'English',
        accent_color: '#9C6B1F',
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
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to save business details.');
        setSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
      </div>
    );
  }

  if (!canAddMore) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-[#D97706]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 font-serif">Account Limit Reached</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Your account has reached the limit of <strong>2 business profiles</strong>. You can manage your existing locations from your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="h-11 px-6 bg-gradient-to-r from-[#D97706] to-[#9C6B1F] text-white font-medium text-sm rounded-xl flex items-center gap-2"
        >
          <span>Return to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#9C6B1F]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="mb-8 text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D97706] to-[#9C6B1F] flex items-center justify-center shadow-lg shadow-[#D97706]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-serif">
            Converge <span className="text-[#D97706]">Reviews</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400">Step 2 of 2: Set up your business profile</p>
      </div>

      {/* Onboarding Form Card */}
      <div className="w-full max-w-lg bg-[#131B2E]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10 shadow-black/50">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <h1 className="text-xl font-bold text-white mb-1">Tell us about your business</h1>
          <p className="text-xs text-slate-400">This configures your custom QR code & AI review prompt engine</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Name *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Harikrushna Eye & Dental Hospital"
                className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Type / Specialty *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. dental and eye clinic"
                className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Google Review Link *</label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                placeholder="https://www.google.com/maps/place/..."
                className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Your official Google Maps review modal link</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Custom Short Link (Slug) *</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="harikrushna-vastral"
                  className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 text-sm font-mono text-amber-400 placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Services / Keywords (Comma separated)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="root canal, eye checkup, painless extraction, friendly doctor"
              className="w-full h-11 bg-slate-900/90 border border-slate-800 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-4 bg-gradient-to-r from-[#D97706] to-[#9C6B1F] hover:from-[#B45309] hover:to-[#784E10] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-[#D97706]/20 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <span>Launch Business Profile & Get QR Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 relative z-10">
        <ShieldCheck className="w-4 h-4 text-[#D97706]" />
        <span>Your review link and QR standee will be ready instantly</span>
      </div>
    </div>
  );
}
