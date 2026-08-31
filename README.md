# Converge Reviews — Multi-Tenant AI Review Acceleration Platform

**Converge Reviews** is a multi-tenant, AI-assisted review acceleration platform designed and built by **Converge Digital** for local Indian businesses across Gujarat (dental & eye clinics, specialty gelato restaurants, coaching institutes, and local service brands).

---

## 🌟 Key Features & Product Architecture

### 1. Counter Customer Flow (`/r/[slug]`)
* **Elderly-Friendly Usability:** Designed for 40–70-year-old clinic patients on mobile devices. Features extra-large **56px touch targets**, 16–20px text size, zero hover dependencies, and a 20-second completion target.
* **5 AI Review Drafts:** Generates 5 distinct, natural-sounding review options pre-loaded with target local SEO keywords (e.g., *"root canal treatment"*, *"eye checkup"*, *"artisanal gelato"*).
* **Dynamic Per-Client Theming:** Automatically inherits the client's database `accent_color` (e.g. Brass `#9C6B1F` for clinics, Basil Green `#3F6C4C` for restaurants).
* **One-Tap Copy & Redirect:** Copies chosen text to mobile clipboard and launches the business's official Google Review popup in a new tab.
* **100% Policy Compliant:** Customers explicitly review, paste, and post themselves. Zero auto-posting.

### 2. Agency Marketing Pitch Site (`/`)
* Boutique agency visual identity featuring an asymmetric hero layout and receipt slip visual motif.
* **Interactive Live Demo:** Embedded interactive widget allowing prospective clients to test star ratings and live 5-draft AI generation directly on the homepage.
* Explains local Google search ranking factors (volume, recency, keyword density).

### 3. Agency Internal Admin Portal (`/admin`)
* Secured via admin secret authentication token (`ADMIN_PASSWORD`).
* **Multi-Tenant Client Onboarding:** Add or edit business profiles (`slug`, `business_name`, `business_type`, `google_review_link`, `keywords`, `tone`, `language`, `accent_color`).
* **Standee PNG QR Code Generator:** 1-click generation of high-resolution **PNG QR Codes** (`qr-[slug].png`) ready for printing counter standees.
* **Conversion Analytics:** Tracks Total Scans, Completed Reviews, Conversion Rate %, and Average Star Rating per client.
* **Background Retention Cleanup:** Scheduled API endpoint (`/api/admin/cleanup-drafts`) to purge draft history older than 30 days.

---

## 🔒 Security & Anti-Redundancy Architecture

1. **Zero Public Writes on Database:** Public write permissions on `scans` and `draft_log` tables are disabled via Supabase Row Level Security (RLS). All scan tracking and client updates run server-side via API routes using `SUPABASE_SERVICE_ROLE_KEY`.
2. **Anti-Repeat Draft Memory (`draft_log`):** Server logs past draft openings per client. Subsequent AI requests check recent history and force all 5 new drafts to open with completely different sentence structures and words.
3. **Cliché Banning:** AI prompt explicitly forbids overused stock phrases (*"highly recommend"*, *"top-notch"*, *"exceeded expectations"*) in favor of ordinary, specific details.
4. **Rate Limiting:** In-memory sliding window rate limiter per IP address.

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16.3.3 (App Router, Turbopack)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS v4 (`@theme` tokens, `@utility` directives)
* **Database:** Supabase (PostgreSQL + RLS policies)
* **AI Engine:** Google Gemini API (`gemini-3.5-flash`, `gemini-3.6-flash`) & OpenRouter API (`meta-llama/llama-3.3-70b-instruct:free`, `qwen/qwen-2.5-72b-instruct:free`)
* **QR Generation:** `qrcode` (npm)
* **Typography:** `next/font/google` (`Outfit`, `IBM Plex Sans`, `IBM Plex Mono`, `Fraunces`)

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Vatsal1805/Converge_Reviews_tool.git
cd Converge_Reviews_tool
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
ADMIN_PASSWORD=converge_secret_admin_2026
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Migration
Run the SQL script located at `supabase/migration.sql` inside your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License & Credits
Built by **Converge Digital**, Gujarat, India.
