# Royal Heritage Indian Couture Atelier & Digital Showroom

A luxury, tailoring-first digital showroom and admin studio built with **Next.js 16 (App Router + React 19 + TypeScript + Tailwind CSS v4)**, **GSAP**, **Motion**, and **Supabase** — crafted to run completely standalone with its own GitHub repository, Supabase project, and Vercel deployment.

---

## ⚜️ Key Capabilities & Haute Features

- **Royal Grand Unveiling Ceremony (`RoyalGrandUnveiling.tsx`):** Split-velvet portal gates, embossed golden brand medallion, royal salutation ("Shubh Aagaman"), and auto/interactive unveil with replay support.
- **Harmonic Web Audio Synthesizer (`sound.ts`):** 100% self-contained acoustic temple chimes, silk rustles, and tactile brass click feedback with a one-click audio equalizer visualizer pill in the navbar.
- **The Atelier Fabric Loom (`FabricLoomSection.tsx`):** Interactive tactile textile lounge exploring 4 signature royal weaves (24k Gold Zari Banarasi Katan, Raw Chanderi Tissue, Imperial Velvet & Zardozi, and Super 150s Savile Wool) with instant WhatsApp swatch briefs.
- **VIP Concierge & Atelier Salon Drawer (`RoyalConciergeDrawer.tsx`):** Sliding appointment drawer for in-studio private trials (Jaipur, Mumbai, Delhi), virtual HD video drape consultations, and bridal trousseau styling.
- **Interactive 3D Perspective Tilt & Specular Glare:** Real-time cursor light tracking simulating physical chandelier reflections on frosted bevel glass garment cards.
- **Dynamic Brand & Showroom Admin Studio (`/admin`):** Live brand identity, monogram, tagline, hero copy, address, phone, opening hours, Instagram, and receiving WhatsApp number managed with zero code changes.
- **Order Same-As-Shown OR Customize:** Every catalogue piece supports ordering the photographed design directly (standard size or bespoke measurements) or customizing mill fabric, shade swatch, silhouette fit, and custom instructions.
- **Direct WhatsApp Tailoring Briefs:** Structured order briefs (`Archive Order`, `Catalogue Customisation`, or `From-Scratch Bespoke Brief`) format cleanly into `https://wa.me/<number>?text=...` and optionally log to Supabase `custom_inquiries`.
- **Editorial Lookbook & Multi-Filter Archive:** Filter by category, cloth/fabric, occasion, customizable availability, or instant search.

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

Visit:
- **Showroom Storefront:** `http://localhost:3000`
- **Atelier Admin Studio:** `http://localhost:3000/admin`

---

## 🔐 Connecting Your Isolated Supabase + Vercel

1. **Create a brand-new Supabase project** (separate from any earlier projects).
2. Open **SQL Editor** in Supabase and run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication -> Users**, add the showroom owner's email & password.
4. Copy [`.env.example`](.env.example) to `.env.local` and paste your new project's URL & Anon Key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   NEXT_PUBLIC_ADMIN_EMAILS=owner@youratelier.com
   ```
5. Import this repository into **Vercel**, configure the environment variables, and deploy!
