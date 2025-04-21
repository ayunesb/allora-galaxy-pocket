
# 🌌 Allora OS

**Allora OS** is an AI-powered business operating system designed to help founders automate, launch, and scale their startup through strategies, campaigns, agents, and insights — all from one centralized platform.

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/allora-os.git
cd allora-os
```

### 2. Setup environment variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the app

```bash
npm run dev
```

---

## 🧠 Tech Stack

- React + TypeScript + Vite
- TailwindCSS + ShadCN
- Supabase (Auth, DB, Edge Functions)
- Stripe, HubSpot, GA4, Shopify, LangChain, HeyGen
- Modular hooks + agents + campaign architecture

---

## 🗂️ Folder Structure

```plaintext
src/
  app/               ← Main pages/modules
  components/        ← Global UI components
  hooks/             ← Auth, tenant, toast, etc.
  guards/            ← Route protection
  types/             ← Shared data models
  edge-functions/    ← Supabase CRON logic
  pages/auth/        ← Login / Signup
```

---

## 🔐 Auth & Providers

- `AuthProvider` + Supabase session
- `TenantProvider` for multi-tenant context
- `useToast()` for lightweight feedback
- Protected layouts via `RequireAuth` and `AdminOnly`

---

## 🧪 Edge Functions

- `sendMilestoneAlerts`: weekly strategy KPIs
- `decrementCredits`: per-tenant usage billing

---

## 📬 Feedback & Contributions

Feel free to open an issue or submit a PR. Built with love from the Galaxy 💫
