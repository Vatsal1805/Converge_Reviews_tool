import { NextRequest, NextResponse } from 'next/server';
import { getClientBySlug, supabaseAdmin } from '@/lib/supabase';

// Simple in-memory rate limiting per IP (max 12 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitWindow = 60 * 1000;
  const maxRequests = 12;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindow });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

// Fetch helper with AbortController 4-second timeout per call
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Fallback review generator returning 5 short, non-generic reviews
function generateFallbackReviews(
  businessName: string,
  businessType: string,
  rating: number,
  keywords: string[]
): string[] {
  const kw1 = keywords[0] || 'service';
  const kw2 = keywords[1] || 'care';
  const kw3 = keywords[2] || 'staff';

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

/**
 * Fetch last 15 draft rows from draft_log for client_id and extract first 5-6 words of each draft
 */
async function getRecentOpenings(clientId: string): Promise<string> {
  console.time('fetch_recent_openings');
  try {
    const { data, error } = await supabaseAdmin
      .from('draft_log')
      .select('drafts')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !data || data.length === 0) {
      console.timeEnd('fetch_recent_openings');
      return '';
    }

    const openingsSet = new Set<string>();

    data.forEach((row) => {
      if (Array.isArray(row.drafts)) {
        row.drafts.forEach((draftStr: string) => {
          if (typeof draftStr === 'string' && draftStr.trim().length > 0) {
            const words = draftStr.trim().split(/\s+/).slice(0, 5).join(' ');
            if (words) {
              openingsSet.add(words.toLowerCase());
            }
          }
        });
      }
    });

    console.timeEnd('fetch_recent_openings');
    return Array.from(openingsSet).slice(0, 10).join(', ');
  } catch (err) {
    console.warn('Error fetching recent openings from draft_log:', err);
    console.timeEnd('fetch_recent_openings');
    return '';
  }
}

/**
 * Fire-and-forget non-blocking insert into draft_log table
 */
function logGeneratedDrafts(clientId: string, starRating: number, drafts: string[]) {
  (async () => {
    try {
      const { error } = await supabaseAdmin.from('draft_log').insert([
        {
          client_id: clientId,
          star_rating: starRating,
          drafts: drafts,
        },
      ]);
      if (error) {
        console.warn('Background draft_log insert warning:', error.message);
      }
    } catch (err: any) {
      console.warn('Background draft_log insert error:', err);
    }
  })();
}

export async function POST(req: NextRequest) {
  console.time('total_generate_reviews_request');
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip)) {
      console.timeEnd('total_generate_reviews_request');
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    // 2. Parse Request Payload
    const body = await req.json();
    const { slug, rating } = body;

    if (!slug || typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.timeEnd('total_generate_reviews_request');
      return NextResponse.json(
        { error: 'Invalid request parameters. Must provide slug and star rating (1-5).' },
        { status: 400 }
      );
    }

    // 3. Fetch Client configuration from Database
    const client = await getClientBySlug(slug);
    if (!client) {
      console.timeEnd('total_generate_reviews_request');
      return NextResponse.json({ error: 'Business client not found.' }, { status: 404 });
    }

    const { business_name, business_type, keywords, tone, language } = client;
    const kwString = Array.isArray(keywords) && keywords.length > 0 ? keywords.join(', ') : 'service';

    // 4. Extract recent openings from draft_log table for anti-redundancy
    const recentOpenings = await getRecentOpenings(client.id);

    // 5. Build System Prompt & User Prompt
    const systemPrompt = `You are ghostwriting a short Google review in the authentic voice of a real, one-time customer — not a copywriter, not a brand voice, not an assistant. Tone: ${tone || 'warm and reassuring'}. Language: ${language || 'English'}.

Never use these overused review phrases or close variants of them: 'highly recommend', 'great experience', 'highly professional', 'top-notch', 'exceeded expectations', 'will definitely come back', 'hidden gem', 'exceptional service'. Real customers describe one or two specific, ordinary details instead of using these stock phrases.`;

    let userPrompt = `Write 5 short Google reviews for '${business_name}', a ${business_type}, from a customer who just had a ${rating}-star experience.

Naturally work in 1-2 of these keywords only where they'd genuinely fit — never force one in: ${kwString}.

Rules:
- 20 to 35 words each (never shorter than 20 — short one-liners carry no useful detail or keyword value).
- Each of the 5 must open differently and use a different sentence structure — do not let them read like variations of the same template.`;

    if (recentOpenings) {
      userPrompt += `\n- Do not start any review with these recently-used openings for this business, or close variants of them: ${recentOpenings}`;
    }

    userPrompt += `\n- Mention one small, specific, ordinary detail (a wait time, a staff member's helpfulness, how a specific concern was handled) rather than generic praise.
- Plain, unpolished language — how someone actually types on their phone, not broken grammar or fake typos, just unpolished and specific.
- If the rating is 1-3 stars, the review should sound like genuine, fair feedback — specific about what fell short, not exaggerated negativity, and not softened into fake positivity either. Do not suppress or soften negative ratings — every rating gets an honest draft.
- Do not use any of the banned phrases from the system instructions.

Return ONLY a raw JSON array of 5 strings, nothing else.`;

    // 6. Execute Call to AI Providers with Model-Specific Thinking Config, Token Caps & 4s Timeouts
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      const geminiModelConfigs = [
        {
          model: 'gemini-3.5-flash',
          thinkingConfig: { thinkingLevel: 'minimal' },
        },
        {
          model: 'gemini-3.6-flash',
          thinkingConfig: { thinkingLevel: 'minimal' },
        },
        {
          model: 'gemini-2.5-flash',
          thinkingConfig: { thinkingBudget: 0 },
        },
      ];

      for (const config of geminiModelConfigs) {
        const timerLabel = `provider_${config.model}`;
        console.time(timerLabel);
        try {
          const res = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.8,
                  maxOutputTokens: 600,
                  thinkingConfig: config.thinkingConfig,
                },
              }),
            },
            4000
          );

          if (res.ok) {
            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResponse) {
              const cleanedText = textResponse.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
              const parsed = JSON.parse(cleanedText);
              if (Array.isArray(parsed) && parsed.length >= 5) {
                const final5Drafts = parsed.slice(0, 5);
                console.timeEnd(timerLabel);
                console.timeEnd('total_generate_reviews_request');
                // Non-blocking fire-and-forget logging to draft_log
                logGeneratedDrafts(client.id, rating, final5Drafts);
                return NextResponse.json({
                  success: true,
                  drafts: final5Drafts,
                  provider: `gemini-${config.model}`,
                });
              }
            }
          }
        } catch (e) {
          console.warn(`Gemini model ${config.model} attempt failed or timed out:`, e);
        } finally {
          console.timeEnd(timerLabel);
        }
      }
    }

    // Try OpenRouter API with 4s timeout
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey.trim() !== '') {
      const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
      console.time('provider_openrouter');
      try {
        const res = await fetchWithTimeout(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              'X-Title': 'Converge Reviews',
            },
            body: JSON.stringify({
              model: openRouterModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.8,
              max_tokens: 600,
            }),
          },
          4000
        );

        if (res.ok) {
          const data = await res.json();
          const textResponse = data.choices?.[0]?.message?.content;

          if (textResponse) {
            const cleanedText = textResponse.trim().replace(/^```json\s*/i, '').replace(/```$/i, '');
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed.length >= 5) {
              const final5Drafts = parsed.slice(0, 5);
              console.timeEnd('provider_openrouter');
              console.timeEnd('total_generate_reviews_request');
              logGeneratedDrafts(client.id, rating, final5Drafts);
              return NextResponse.json({
                success: true,
                drafts: final5Drafts,
                provider: `openrouter-${openRouterModel}`,
              });
            }
          }
        }
      } catch (e) {
        console.warn('OpenRouter generation failed or timed out:', e);
      } finally {
        console.timeEnd('provider_openrouter');
      }
    }

    // Fallback Generator if AI APIs are unavailable or timed out
    const fallbackDrafts = generateFallbackReviews(business_name, business_type, rating, keywords);
    console.timeEnd('total_generate_reviews_request');
    logGeneratedDrafts(client.id, rating, fallbackDrafts);
    return NextResponse.json({
      success: true,
      drafts: fallbackDrafts,
      provider: 'fallback',
    });
  } catch (error: any) {
    console.error('API Error in /api/generate-reviews:', error);
    console.timeEnd('total_generate_reviews_request');
    return NextResponse.json(
      { error: "Couldn't generate review ideas. Try again." },
      { status: 500 }
    );
  }
}
