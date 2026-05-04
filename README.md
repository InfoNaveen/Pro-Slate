
  # ⚡ ProSlate

  **The Elite Surface Finishing Labor Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

  *Empowering Homeowners, B2B Clients, and Verified Surface Finishing Professionals.*
</div>

---

## 🌟 Vision

**ProSlate** is a high-performance marketplace and job management platform tailored exclusively for the surface finishing industry. Whether it's flooring, painting, tiling, or waterproofing, ProSlate brings military-grade precision to construction labor through intelligent pricing, immutable escrow, and rigorous worker verification.

---

## 🚀 Key Features

### 1. ⚙️ Standardized Pricing Engine (SPE)
A revolutionary 6-step algorithmic engine that calculates fair, transparent labor costs across 8 distinct surface types. No more haggling; just data-driven pricing based on square footage, complexity, and worker skill level.

### 2. 🛡️ 4-Stage Milestone Escrow Protocol
Say goodbye to payment disputes. Our escrow system locks funds and releases them strictly upon the completion of 4 critical milestones:
- **Surface Prep** → **Mid-Point Check** → **Final Polish** → **Sign-off**.

### 3. 🎖️ Verified Skill Matrix & Badge System
Workers aren't just rated; they are *certified*. Our algorithmic Skill Matrix analyzes past performance, reliability, and CV verification to award dynamic badges:
`Rookie` ➡️ `Verified` ➡️ `Expert` ➡️ `Master`

### 4. 🏢 B2B Contract Module
A dedicated portal for Enterprise and B2B clients to deploy massive teams, track large-scale deployments, and handle bulk milestone reporting with real-time analytics.

### 5. 📱 4 Dedicated Portals (PWA Ready)
Tailored experiences built as installable Progressive Web Apps for every stakeholder:
- **Homeowner Portal**: Track jobs, release escrow, leave reviews.
- **Worker Portal**: Claim jobs, upload proof-of-work, track earnings.
- **B2B Portal**: Contract management and multi-worker deployment.
- **Admin Command Center**: Complete oversight, dispute resolution, and CV verification.

---

## 🛠️ Tech Stack Architecture

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Framework** | Next.js 14 (App Router) | High-speed SSR, routing, API layer |
| **Database & Auth** | Supabase (PostgreSQL) | RLS policies, Auth, Storage, Edge Functions |
| **Styling** | Tailwind CSS + Shadcn/ui | Premium, brutalist-inspired UI components |
| **State** | Zustand + React Hook Form | Blazing fast client state & forms |
| **Validation** | Zod | End-to-end type safety |

---

## 🚦 Getting Started

### Prerequisites
- Node.js `18.x` or higher
- A Supabase Project

### 1. Clone & Install
```bash
git clone https://github.com/InfoNaveen/Pro-Slate.git
cd proslate
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration & Seeding
Execute the SQL files inside the `/supabase` folder via the Supabase SQL Editor:
1. Run `supabase/migrations/001_initial.sql`
2. Run `supabase/seed.sql`

### 4. Ignite the Engines
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the platform locally.

---

## 🏗️ Deployment

ProSlate is heavily optimized for Vercel. 
Simply import the repository into Vercel, attach the environment variables, and hit Deploy. The next-pwa plugin will automatically generate the required service workers during the build phase.

---

<div align="center">
  <i>Built with precision. Designed for scale.</i>
</div>
