'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { ClientRecord, logScanEvent } from '@/lib/supabase';

interface CustomerFlowProps {
  client: ClientRecord;
}

// Fallback stub drafts for 5 options
function getStubDrafts(client: ClientRecord, rating: number): string[] {
  const businessName = client.business_name;
  const kw1 = client.keywords[0] || 'service';
  const kw2 = client.keywords[1] || 'care';
  const kw3 = client.keywords[2] || 'staff';

  if (rating >= 4) {
    return [
      `Stopped by ${businessName} earlier today for ${kw1}. The front desk managed check-in quickly and answered all my questions without rushing.`,
      `The team at ${businessName} took care of my ${kw2} seamlessly. Everything was explained beforehand and the facility was immaculate.`,
      `Had a smooth visit for ${kw1} at ${businessName}. The appointment started on time and the doctor was very thorough.`,
      `Really appreciated how clean and organized ${businessName} is. The ${kw3} helped me get sorted right away at the desk.`,
      `Good attention to detail during my ${kw2} visit at ${businessName}. Clear instructions given and zero hassle at checkout.`,
    ];
  } else if (rating === 3) {
    return [
      `Decent visit to ${businessName}. The ${kw1} was fine, though waiting in the lobby took longer than scheduled.`,
      `The staff at ${businessName} were polite during my ${kw2}, but reception felt a bit understaffed during peak hours.`,
      `Fair overall service at ${businessName}. The ${kw3} answered my questions, but overall appointment took about an hour.`,
      `Clean facility at ${businessName}. Service for ${kw1} was satisfactory, though scheduling could be streamlined.`,
      `Average experience for ${kw2} at ${businessName}. Helpful doctor, but front desk process was slightly slow.`,
    ];
  } else {
    return [
      `Visited ${businessName} recently for ${kw1}. The wait time exceeded 45 minutes despite having a prior appointment.`,
      `Front desk communication at ${businessName} could use improvement regarding ${kw2} scheduling and follow-ups.`,
      `The service for ${kw1} at ${businessName} was disappointing today. Polite staff, but overall flow felt disorganized.`,
      `Had a delayed check-in experience at ${businessName}. Hoping management addresses the lobby wait times soon.`,
      `Room for improvement at ${businessName}. The ${kw3} was okay, but handling of ${kw2} felt rushed.`,
    ];
  }
}

export default function CustomerFlow({ client }: CustomerFlowProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Per-client dynamic accent color (defaults to brass #9C6B1F)
  const accentColor = client.accent_color || '#9C6B1F';

  // Log page scan on initial mount via secure API route
  useEffect(() => {
    async function initScan() {
      const id = await logScanEvent(client.id, undefined, undefined, false);
      if (id) setScanId(id);
    }
    initScan();
  }, [client.id]);

  // Handle rating selection & live AI draft generation
  const handleRatingSelect = async (selectedRating: number) => {
    setRating(selectedRating);
    setIsLoading(true);
    setErrorMessage(null);
    setIsCopied(false);

    // Log rating event to database
    if (client.id) {
      logScanEvent(client.id, selectedRating, undefined, false);
    }

    try {
      const res = await fetch('/api/generate-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: client.slug, rating: selectedRating }),
      });

      const data = await res.json();
      if (res.ok && data.drafts && Array.isArray(data.drafts)) {
        setDrafts(data.drafts);
        setCurrentIndex(0);
      } else {
        const fallbacks = getStubDrafts(client, selectedRating);
        setDrafts(fallbacks);
        setCurrentIndex(0);
      }
    } catch (err) {
      const fallbacks = getStubDrafts(client, selectedRating);
      setDrafts(fallbacks);
      setCurrentIndex(0);
    } fontFinally: {
      setIsLoading(false);
    }
  };

  // Next draft in card carousel
  const handleNextDraft = () => {
    if (drafts.length === 0) return;
    const nextIdx = (currentIndex + 1) % drafts.length;
    setCurrentIndex(nextIdx);
  };

  // Previous draft in card carousel
  const handlePrevDraft = () => {
    if (drafts.length === 0) return;
    const prevIdx = (currentIndex - 1 + drafts.length) % drafts.length;
    setCurrentIndex(prevIdx);
  };

  // Main Action: Copy to clipboard & open Google Review URL
  const handleUseReview = async () => {
    const selectedText = drafts[currentIndex];
    if (!selectedText) return;

    // 1. Copy text to clipboard (with fallback for older mobile devices)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(selectedText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = selectedText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    // 2. Log completed conversion step to database via API
    if (client.id && rating) {
      logScanEvent(client.id, rating, currentIndex, true);
    }

    // 3. Open business Google review URL synchronously
    try {
      window.open(client.google_review_link, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // Fallback redirect
      window.location.href = client.google_review_link;
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-paper text-ink">
      {/* Surface A Card Shell — Receipt / Slip Aesthetic */}
      <div className="w-full max-w-md bg-paper-raised rounded-2xl border border-line shadow-slip p-6 sm:p-8 space-y-6 transition-all duration-200">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper border border-line text-xs font-mono tracking-wide text-ink/70">
            <span>Official Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            {client.business_name}
          </h1>
          <p className="text-sm sm:text-base text-ink/70 capitalize">
            {client.business_type}
          </p>
        </div>

        <div className="perforation-divider my-2" />

        {/* Step 1: Star Rating Selector */}
        <div className="space-y-3 text-center">
          <p className="text-base sm:text-lg font-medium text-ink">
            {rating === null ? 'How was your experience today?' : 'Your rating:'}
          </p>
          
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-2">
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const active = starIndex <= (hoverRating ?? rating ?? 0);
              return (
                <button
                  key={starIndex}
                  type="button"
                  onClick={() => handleRatingSelect(starIndex)}
                  onMouseEnter={() => setHoverRating(starIndex)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="tactile-btn p-1.5 focus:outline-none rounded-lg transition-transform focus-visible:ring-2 focus-visible:ring-brass"
                  style={{ width: '56px', height: '56px' }}
                  aria-label={`Rate ${starIndex} out of 5 stars`}
                >
                  <Star
                    className="w-full h-full transition-colors duration-150"
                    style={{
                      color: active ? accentColor : '#D9D4C7',
                      fill: active ? accentColor : 'transparent',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center space-y-3 animate-pulse">
            <RefreshCw
              className="w-8 h-8 mx-auto animate-spin"
              style={{ color: accentColor }}
            />
            <p className="text-base font-medium text-ink/80">
              Getting review ideas ready...
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Step 2: AI Draft Selection Card Carousel */}
        {!isLoading && rating !== null && drafts.length > 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider uppercase text-ink/60">
                Draft {currentIndex + 1} of {drafts.length}
              </span>
              <span className="text-xs text-ink/50">Tap arrows to change</span>
            </div>

            {/* Draft Card Container */}
            <div className="relative group">
              <div className="min-h-[130px] p-5 rounded-xl bg-paper border border-line flex items-center justify-center text-center shadow-inner">
                <p className="text-base sm:text-lg text-ink font-normal leading-relaxed">
                  "{drafts[currentIndex]}"
                </p>
              </div>

              {/* Navigation Controls */}
              <button
                type="button"
                onClick={handlePrevDraft}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-paper-raised border border-line shadow-sm text-ink hover:bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                aria-label="Previous draft"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                onClick={handleNextDraft}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-paper-raised border border-line shadow-sm text-ink hover:bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                aria-label="Next draft"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Dots (for 5 drafts) */}
            <div className="flex justify-center items-center gap-2">
              {drafts.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: idx === currentIndex ? accentColor : '#D9D4C7',
                    transform: idx === currentIndex ? 'scale(1.2)' : 'scale(1)',
                  }}
                  aria-label={`Go to draft ${idx + 1}`}
                />
              ))}
            </div>

            {/* Step 3: Main Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleUseReview}
                className="tactile-btn w-full h-[56px] rounded-xl font-medium text-lg text-white flex items-center justify-center gap-2 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: accentColor }}
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Copied! Opening Google...</span>
                  </>
                ) : (
                  <>
                    <span>Use this review</span>
                    <ExternalLink className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-ink/60">
                Text will copy automatically so you can paste & post on Google.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-xs text-ink/50 font-sans">
        Powered by{' '}
        <a
          href="/"
          className="font-medium underline hover:text-ink transition-colors"
        >
          Converge Reviews
        </a>
      </footer>
    </main>
  );
}
