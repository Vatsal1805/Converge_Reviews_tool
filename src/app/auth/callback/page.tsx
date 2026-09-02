'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Completing authentication...');

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // 1. Get session from URL hash / Supabase OAuth callback
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();

        let user = sessionData?.session?.user;

        if (!user) {
          // Listen for auth state change if session hasn't completed hash parsing
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              await processUserRouting(session.user);
            }
          });
          return;
        }

        await processUserRouting(user);
      } catch (err: any) {
        console.warn('OAuth Callback Error:', err);
        router.push('/login');
      }
    }

    async function processUserRouting(user: any) {
      setStatusText('Verifying account permissions...');

      try {
        const res = await fetch('/api/auth/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, email: user.email }),
        });

        const roleData = await res.json();

        if (roleData.isAdmin) {
          setStatusText('Welcome Admin! Redirecting to Super-Admin Portal...');
          router.push('/admin');
        } else if (roleData.clientCount === 0) {
          setStatusText('Welcome! Setting up your new business onboarding...');
          router.push('/onboarding');
        } else {
          setStatusText('Welcome back! Loading your business dashboard...');
          router.push('/dashboard');
        }
      } catch (e) {
        router.push('/dashboard');
      }
    }

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#9C6B1F] flex items-center justify-center shadow-lg shadow-[#D97706]/20 mb-4 animate-bounce">
        <Sparkles className="w-7 h-7 text-white" />
      </div>

      <Loader2 className="w-8 h-8 animate-spin text-[#D97706] mb-4" />
      <h1 className="text-xl font-bold font-serif mb-1">Converge Reviews</h1>
      <p className="text-sm text-slate-400 max-w-sm">{statusText}</p>
    </div>
  );
}
