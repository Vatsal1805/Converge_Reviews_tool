'use client';

import { useState } from 'react';
import { Star, RefreshCw, Check, ExternalLink } from 'lucide-react';

export default function PitchDemoWidget() {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [drafts, setDrafts] = useState<string[]>([
    'Stopped by Harikrushna Dental & Eye Hospital earlier today for my eye checkup. The front desk managed check-in quickly and answered all my questions.',
    'The team at Harikrushna Clinic took care of my root canal treatment seamlessly. Everything was explained beforehand and the facility was immaculate.',
    'Had a smooth visit for dental care at Harikrushna Hospital. The appointment started on time and the doctor was very thorough throughout.',
    'Really appreciated how clean and organized Harikrushna Clinic is. The nursing staff helped me get sorted right away at the desk.',
    'Good attention to detail during my cataract consultation at Harikrushna Clinic. Clear instructions given and zero hassle at checkout.',
  ]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRatingChange = async (rating: number) => {
    setSelectedRating(rating);
    setIsLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/generate-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'test-clinic', rating }),
      });

      const data = await res.json();
      if (res.ok && data.drafts && Array.isArray(data.drafts)) {
        setDrafts(data.drafts);
        setActiveIdx(0);
      }
    } catch (e) {
      // Keep existing drafts if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTest = () => {
    if (drafts[activeIdx]) {
      navigator.clipboard?.writeText(drafts[activeIdx]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-paper-raised rounded-2xl border border-line shadow-slip p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-brass">Live Interactive Demo</span>
          <h3 className="font-display font-bold text-lg text-ink">Harikrushna Dental & Eye Hospital</h3>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-paper border border-line text-[11px] font-mono text-ink/70">
          /r/test-clinic
        </div>
      </div>

      {/* Star Rating Controls */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
          Step 1: Select Star Rating
        </span>
        <div className="flex justify-center gap-2 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="tactile-btn p-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              style={{ width: '48px', height: '48px' }}
            >
              <Star
                className="w-full h-full"
                style={{
                  color: star <= selectedRating ? '#9C6B1F' : '#D9D4C7',
                  fill: star <= selectedRating ? '#9C6B1F' : 'transparent',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* AI Drafts Output */}
      {isLoading ? (
        <div className="py-8 text-center space-y-2 animate-pulse">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-brass" />
          <p className="text-sm font-medium text-ink/70">Generating 5 AI drafts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-ink/60">
            <span>Step 2: Customer Selects Draft</span>
            <span>Draft {activeIdx + 1} of {drafts.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-paper border border-line text-center text-sm sm:text-base text-ink min-h-[90px] flex items-center justify-center">
            "{drafts[activeIdx]}"
          </div>

          <div className="flex justify-center gap-2">
            {drafts.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === activeIdx ? '#9C6B1F' : '#D9D4C7',
                  transform: i === activeIdx ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleCopyTest}
            className="tactile-btn w-full h-[52px] rounded-xl bg-brass text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:bg-brass-deep"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <span>Use This Review (Copy & Open Google)</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
