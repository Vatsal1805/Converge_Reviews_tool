import { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  QrCode,
  Star,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  Mail,
  Zap,
  Smartphone,
  Copy,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';
import PitchDemoWidget from '@/components/PitchDemoWidget';

export const metadata: Metadata = {
  title: 'Converge Reviews — Turn Happy Customers into Google Reviews',
  description: 'AI-assisted Google review acceleration platform for local clinics, restaurants, and institutes in Gujarat.',
};

export default function PitchLandingPage() {
  return (
    <div className="min-h-[100dvh] bg-paper text-ink selection:bg-brass selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-line bg-paper/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold font-display text-sm shadow-sm">
              C
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Converge Reviews</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="#demo"
              className="text-xs font-mono uppercase tracking-wider text-ink/70 hover:text-ink transition-colors hidden md:inline-block"
            >
              Live Demo
            </a>
            <a
              href="#pricing"
              className="text-xs font-mono uppercase tracking-wider text-ink/70 hover:text-ink transition-colors hidden md:inline-block"
            >
              Pricing
            </a>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg border border-line bg-paper-raised text-xs font-medium text-ink hover:border-brass hover:text-brass transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-lg bg-brass text-white text-xs font-medium hover:bg-brass-deep transition-all shadow-sm flex items-center gap-1"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Asymmetric Two-Column */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-raised border border-line text-xs font-mono text-brass">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaS Platform for Gujarat Local Businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-ink leading-[1.1]">
              Turn happy customers into 5-star Google reviews in 20 seconds.
            </h1>

            <p className="text-lg sm:text-xl text-ink/80 leading-relaxed max-w-2xl font-normal">
              Place a smart counter QR code at your reception. Customers tap a star rating, pick a short AI draft loaded with your local SEO keywords, and post directly to your Google Maps page.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/signup"
                className="tactile-btn px-6 py-4 rounded-xl bg-brass text-white font-medium text-base flex items-center justify-center gap-2 shadow-slip hover:bg-brass-deep transition-all"
              >
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <a
                href="#demo"
                className="px-6 py-4 rounded-xl border border-line bg-paper-raised text-ink font-medium text-base flex items-center justify-center gap-2 hover:bg-paper transition-colors"
              >
                <span>Try Live Counter Demo</span>
              </a>
            </div>

            {/* Proof Points */}
            <div className="pt-4 flex items-center gap-6 text-xs font-mono text-ink/60 border-t border-line/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-signal-good" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-signal-good" />
                <span>100% Google Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-signal-good" />
                <span>Elderly Friendly (40-70 yrs)</span>
              </div>
            </div>
          </div>

          {/* Right Visual — Tactile Tilted Counter Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative transform lg:rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-paper-raised p-6 sm:p-8 rounded-2xl border border-line shadow-slip-hover space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-brass">Sample Counter Standee</span>
                    <h3 className="font-display font-bold text-lg text-ink">Harikrushna Clinic</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-paper border border-line text-ink">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-center gap-1 text-brass py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-7 h-7 fill-brass" />
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-paper border border-line text-center text-sm italic text-ink/80">
                    "Had a great experience for my root canal treatment. Dr. Harikrushna was very thorough and gentle!"
                  </div>

                  <div className="h-[48px] rounded-xl bg-brass text-white font-medium text-sm flex items-center justify-center gap-2">
                    <Copy className="w-4 h-4" />
                    <span>Post to Google Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="border-t border-line bg-paper-raised py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brass">The Counter Problem</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Why happy customers leave without writing a review.
            </h2>
            <p className="text-base sm:text-lg text-ink/70">
              You deliver great service every day, but your Google rating doesn't reflect it. Here is what stops people at reception:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                01
              </div>
              <h3 className="font-display font-bold text-lg">Mobile Typing Stress</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Older patients (40–70 years old) find typing long sentences on small smartphone keyboards frustrating, even when they want to praise you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                02
              </div>
              <h3 className="font-display font-bold text-lg">Blank Screen Hesitation</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Customers standing at your counter are in a hurry. Faced with a blank text box, they don't know what words to write and give up.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                03
              </div>
              <h3 className="font-display font-bold text-lg">Missing Local SEO Keywords</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Even when people leave 5 stars without text, Google's search algorithm misses key terms like "root canal" or "cataract" that drive search rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="demo" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brass">Interactive Test</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Test the counter review flow right now.
            </h2>
            <p className="text-base text-ink/70">
              Tap a rating below to see how AI generates natural drafts pre-loaded with local SEO keywords.
            </p>
          </div>

          <PitchDemoWidget />
        </div>
      </section>

      {/* Pricing Section (Prompt 6 & SaaS Integration) */}
      <section id="pricing" className="border-t border-line bg-paper-raised py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brass">Simple Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Start free, upgrade when you see results.
            </h2>
            <p className="text-base text-ink/70">
              Get your custom QR code ready in 2 minutes. No credit card required to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial Card */}
            <div className="p-8 rounded-2xl bg-paper border border-line space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-paper-raised border border-line text-xs font-mono text-brass rounded-full">
                  7-Day Free Trial
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-serif text-ink">₹0</span>
                  <span className="text-sm text-ink/60 font-mono">/ 7 days</span>
                </div>
                <p className="text-sm text-ink/70">
                  Full access to test customer QR scanning & review generation at your counter.
                </p>

                <ul className="space-y-3 pt-2 text-sm text-ink/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>Instant QR Code Generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>AI Review Prompt Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>Up to 2 Business Locations</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="tactile-btn w-full py-3.5 rounded-xl border border-line bg-paper-raised text-ink font-medium text-sm text-center hover:bg-paper transition-all"
              >
                Start Free Trial Now
              </Link>
            </div>

            {/* Growth Plan Card */}
            <div className="p-8 rounded-2xl bg-paper border-2 border-brass space-y-6 flex flex-col justify-between shadow-slip relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-brass text-white text-[11px] uppercase font-bold tracking-wider rounded-full shadow-sm">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-brass/10 text-xs font-mono text-brass rounded-full">
                  Full Business Plan
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-serif text-ink">₹500</span>
                  <span className="text-sm text-ink/60 font-mono">setup + ₹299/mo</span>
                </div>
                <p className="text-sm text-ink/70">
                  Complete setup including custom counter standee printing + unlimited monthly AI reviews.
                </p>

                <ul className="space-y-3 pt-2 text-sm text-ink">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>High-Res Counter Standee Printable PNG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>Unlimited AI Review Generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>Live QR Scan Analytics & Conversion Stats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-signal-good" />
                    <span>Priority WhatsApp Support</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="tactile-btn w-full py-3.5 rounded-xl bg-brass text-white font-medium text-sm text-center shadow-sm hover:bg-brass-deep transition-all"
              >
                Get Started with Converge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8 bg-paper text-center text-xs text-ink/60 space-y-2">
        <p>
          Converge Reviews — Designed & Built by{' '}
          <a
            href="https://convergedigitals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-ink"
          >
            Converge Digital
          </a>
          , Gujarat, India.
        </p>
      </footer>
    </div>
  );
}
