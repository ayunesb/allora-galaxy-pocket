
# 📦 Allora OS – Release Notes

## 🔐 Security Upgrades – {current_date}
- Upgraded Vite to 5.2.0 to patch server.fs.deny bypass vulnerabilities
- Upgraded esbuild to 0.18.20 to fix dev server exposure issues
- Upgraded nanoid to 4.0.2 to avoid predictable random ID generation
- Enforced strict dev server file system rules in Vite config
- Audited nanoid usage across application; moved security-critical ID generation to crypto.randomUUID()
- Passed npm audit with zero vulnerabilities

> These security upgrades ensure Allora OS meets professional SaaS-grade standards for deployment and scaling.

## 🚀 Version 2.0 – AI-Powered Business OS  
**Release Date:** {current_date}

---

### 🎯 New Features

#### 🧠 Strategy Engine
- AI Strategy Wizard with dynamic input steps
- StrategyVault w/ detail pages and remix + relaunch
- Feedback loop with Supabase integration
- Weekly KPI report delivery via email

#### 📈 Metrics & Insights
- KPITracker dashboard with live Supabase metrics
- Strategy Feedback Dashboard (used/dismissed with chart)
- Real-time feedback logging + unread badge

#### 💬 Notification System
- Notification log panel with event history
- Mark all as read + unread tracking badge
- Edge-triggered system alerts via Supabase

#### 📤 Export & Reporting
- Export center for strategies, leads, and KPIs
- Download CSV or trigger email report
- Full logging to `export_logs` and audit trail

#### 🧑‍🤝‍🧑 Team Collaboration
- Invite user by email + role selection
- Workspace switching via TenantProvider
- Multi-tenant memory + localStorage fallback

#### 🛠️ Dev & Admin Tools
- Seed Tools UI for instant reset/dev playground
- API routes for feedback, seeds, profile, export
- Supabase CRON + Edge Function scheduler for weekly reports

---

### 🌗 UX & Platform Upgrades
- Dark mode toggle + theme persistence
- Keyboard nav & focus ring for accessibility
- ShadCN toasts across all actions
- Lovable-compatible structure with CLI triggers + routes

---

## 🛣️ Upcoming

- Twilio SMS + voice automation
- Admin analytics per tenant
- AI personalization by user history
- Plugin system for modular expansion

---

Stay tuned 🚀  
_— Allora OS Core Team_
