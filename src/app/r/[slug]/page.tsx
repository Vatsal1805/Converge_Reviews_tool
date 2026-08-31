import { Metadata } from 'next';
import { getClientBySlug } from '@/lib/supabase';
import CustomerFlow from './CustomerFlow';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const client = await getClientBySlug(resolvedParams.slug);

  if (!client) {
    return {
      title: 'Review Link Not Found — Converge Reviews',
    };
  }

  return {
    title: `Leave a Review — ${client.business_name}`,
    description: `Share your experience with ${client.business_name} on Google Reviews in seconds.`,
  };
}

export default async function CustomerReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const client = await getClientBySlug(resolvedParams.slug);

  // If slug doesn't exist, show simple "Link isn't valid" state per design brief
  if (!client) {
    return (
      <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-paper text-ink">
        <div className="w-full max-w-md bg-paper-raised rounded-2xl border border-line shadow-slip p-8 text-center space-y-5">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-display font-bold text-ink">
              This review link isn't valid
            </h1>
            <p className="text-sm text-ink/70">
              The business link you scanned or entered might be mispelled or inactive. Please ask the reception counter for assistance.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-paper border border-line text-sm font-medium text-ink hover:bg-paper-raised transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Converge Reviews</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <CustomerFlow client={client} />;
}
