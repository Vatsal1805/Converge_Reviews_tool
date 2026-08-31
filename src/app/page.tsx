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
} from 'lucide-react';
import PitchDemoWidget from '@/components/PitchDemoWidget';

export const metadata: Metadata = {
  title: 'Converge Reviews — Turn Happy Customers into Google Reviews',
  description: 'AI-assisted Google review acceleration for local clinics, restaurants, and institutes in Gujarat. Built by Converge Digital.',
};

export default function PitchLandingPage() {
  return (
    <div className="min-h-[100dvh] bg-paper text-ink selection:bg-brass selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-line bg-paper/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brass text-white flex items-center justify-center font-bold font-display text-sm">
              C
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Converge Reviews</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#demo"
              className="text-xs font-mono uppercase tracking-wider text-ink/70 hover:text-ink transition-colors hidden sm:inline-block"
            >
              Live Demo
            </a>
            <a
              href="#problem"
              className="text-xs font-mono uppercase tracking-wider text-ink/70 hover:text-ink transition-colors hidden sm:inline-block"
            >
              SEO Impact
            </a>
            <Link
              href="/admin"
              className="px-3.5 py-1.5 rounded-lg border border-line bg-paper-raised text-xs font-mono text-ink/80 hover:border-brass hover:text-brass transition-colors"
            >
              Client Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section — Asymmetric Two-Column per design.md Surface B */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content (60% width) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper-raised border border-line text-xs font-mono text-brass">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Gujarat Local Businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-ink leading-[1.1]">
              Get more Google reviews without typing a word.
            </h1>

            <p className="text-lg sm:text-xl text-ink/80 leading-relaxed max-w-2xl font-normal">
              A counter QR code that generates short, natural AI review drafts in seconds. Your happy customers pick their favorite, tap one button, and post directly to your Google page.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#demo"
                className="tactile-btn px-6 py-4 rounded-xl bg-brass text-white font-medium text-base flex items-center justify-center gap-2 shadow-slip hover:bg-brass-deep transition-all"
              >
                <span>Try Live Counter Demo</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#contact"
                className="px-6 py-4 rounded-xl border border-line bg-paper-raised text-ink font-medium text-base flex items-center justify-center gap-2 hover:bg-paper transition-colors"
              >
                <span>Onboard Your Business</span>
              </a>
            </div>

            {/* Honest Proof Line */}
            <div className="pt-4 flex items-center gap-6 text-xs font-mono text-ink/60 border-t border-line/60">
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

          {/* Right Visual — Tactile Tilted Counter Receipt Card */}
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
                    "Had a great experience for my dental checkup. Dr. Harikrushna and team were very thorough and gentle!"
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
            <span className="text-xs font-mono uppercase tracking-wider text-brass">The Friction</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Why happy customers leave without writing a review.
            </h2>
            <p className="text-base sm:text-lg text-ink/70">
              You deliver great service every day, but your Google rating doesn't reflect it. Here is what stops people at the counter:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                01
              </div>
              <h3 className="font-display font-bold text-lg">Mobile Typing Stress</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Older patients (40–70 years old) find typing long sentences on a small smartphone keyboard frustrating, even when they want to praise you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                02
              </div>
              <h3 className="font-display font-bold text-lg">Blank Screen Hesitation</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Customers stand at the reception counter in a hurry. Faced with a blank text box, they don't know what words to write and give up.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-xl bg-paper-raised border border-line flex items-center justify-center text-ink font-mono font-bold">
                03
              </div>
              <h3 className="font-display font-bold text-lg">Missing Local SEO Keywords</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                Even when people leave 5 stars without text, Google's algorithm misses relevant terms like "root canal" or "gelato" that drive new search rankings.
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

          {/* Embedded Live Pitch Demo Component */}
          <PitchDemoWidget />
        </div>
      </section>

      {/* How Local SEO Works */}
      <section className="border-t border-line bg-paper-raised py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-brass">Search Algorithm</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              How Google ranks local businesses in Gujarat.
            </h2>
            <p className="text-base text-ink/70 leading-relaxed">
              Google Maps & Search rankings lean heavily on three factors: total review count, recent review frequency, and keyword density inside review text.
            </p>
            
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3 text-sm text-ink">
                <CheckCircle2 className="w-5 h-5 text-signal-good flex-shrink-0 mt-0.5" />
                <span><strong>Natural Keywords:</strong> Quietly weaves search terms like "eye checkup" or "waffle cone" into drafts.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink">
                <CheckCircle2 className="w-5 h-5 text-signal-good flex-shrink-0 mt-0.5" />
                <span><strong>100% Policy Compliant:</strong> The customer explicitly pastes & submits on Google themselves. Zero auto-posting.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink">
                <CheckCircle2 className="w-5 h-5 text-signal-good flex-shrink-0 mt-0.5" />
                <span><strong>Multi-Tenant Ready:</strong> Onboard new clinic, restaurant, or institute locations in under 5 minutes.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-paper p-8 rounded-2xl border border-line space-y-4">
            <div className="flex items-center gap-2 text-brass font-mono text-xs uppercase">
              <TrendingUp className="w-4 h-4" />
              <span>Conversion Funnel</span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-paper-raised rounded-xl border border-line flex justify-between items-center text-sm">
                <span>1. Scan QR Code</span>
                <span className="font-mono text-xs text-brass">100% Reach</span>
              </div>
              <div className="p-3 bg-paper-raised rounded-xl border border-line flex justify-between items-center text-sm">
                <span>2. Select Star Rating</span>
                <span className="font-mono text-xs text-brass">&lt; 3 Seconds</span>
              </div>
              <div className="p-3 bg-paper-raised rounded-xl border border-line flex justify-between items-center text-sm">
                <span>3. Pick AI Draft</span>
                <span className="font-mono text-xs text-brass">&lt; 10 Seconds</span>
              </div>
              <div className="p-3 bg-brass text-white rounded-xl flex justify-between items-center text-sm font-medium">
                <span>4. Copy & Post on Google</span>
                <span className="font-mono text-xs">Done in &lt; 20s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Contact / Inquiry Section */}
      <section id="contact" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-brass">Partner With Us</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Ready to get more Google reviews for your business?
          </h2>
          <p className="text-base text-ink/70 max-w-xl mx-auto">
            Converge Digital provides end-to-end setup including custom standee design, QR printing, and monthly review reports.
          </p>
        </div>

        <div className="inline-flex flex-col sm:flex-row items-center gap-4 justify-center bg-paper-raised p-6 rounded-2xl border border-line shadow-slip w-full max-w-md mx-auto">
          <a
            href="mailto:contact@convergedigitals.com?subject=Converge%20Reviews%20Inquiry"
            className="tactile-btn w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brass text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Converge Digital</span>
          </a>

          <a
            href="tel:+919876543210"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-line bg-paper text-ink font-medium text-sm flex items-center justify-center gap-2 hover:bg-paper-raised"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Our Team</span>
          </a>
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
