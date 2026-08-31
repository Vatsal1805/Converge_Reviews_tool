import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Outfit, Fraunces } from 'next/font/google';
import './globals.css';

const ibmSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-sans',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Converge Reviews — AI Review Acceleration for Local Businesses',
  description: 'Helping local business customers leave genuine Google reviews in under 20 seconds with AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmSans.variable} ${ibmMono.variable} ${outfit.variable} ${fraunces.variable}`}
    >
      <body className="bg-paper text-ink min-h-[100dvh] antialiased selection:bg-brass selection:text-white">
        {children}
      </body>
    </html>
  );
}
