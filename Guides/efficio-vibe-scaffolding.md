# Efficio Vibe Agent Scaffolding

## Description

This is the Vibe/Cursor-ready scaffolding template to guide AI agents in building the Efficio fashion artisan business management app.

---

## App Overview

- Name: Efficio
- Description: Business management tool for fashion artisans in Ghana
- Key Workflows: Client tracking, order management, inventory, payments
- Platforms: Mobile-first (PWA), Web
- Language: English only
- Currency: GHC (Ghana Cedis)

---

## Technology Stack

```json
{
  "frontend": "Next.js",
  "styling": "Tailwind CSS + ShadCN UI",
  "auth": "Clerk",
  "backend": "tRPC",
  "database": "PostgreSQL via Drizzle ORM (Neon)",
  "storage": "Cloud blobs for image/PDF upload",
  "notifications": ["Twilio SMS", "WhatsApp API", "Email (Clerk/Resend)"],
  "payments": [
    "MTN Mobile Money API",
    "AirtelTigo Cash API",
    "Telecel Cash API",
    "Cash (manual entry)"
  ],
  "deployment": "Vercel",
  "pwa": true,
  "offline_support": true
}
```

---

## Core Modules

### Auth

- Clerk-based signup/login
- Single user access per account
- JWT sessions

### Client Management

- Create/update client profiles
- Add measurements (standard fields for clothing)
- View client order/payment history

### Orders

- Create/edit orders
- Upload sketches/images (JPG/PNG) + PDFs
- Text notes
- Link to clients & inventory
- View offline

### Inventory

- Add/update fabrics, accessories
- Alert on low stock

### Payments

- MoMo APIs: MTN, AirtelTigo, Telecel
- Manual cash entry
- Store receipts

### Notifications

- Order-ready, payment-confirmed
- WhatsApp and SMS first
- Email fallback

### Offline

- Cache client, order, payment data for read-only
- Sync when online

---

## Pages/Folders

```
/app
  /auth
  /dashboard
  /clients
  /orders
  /inventory
  /settings
  /payments
/components
/lib
/utils
/styles
```

---

## Notes to Agent

- Prioritize mobile-first design.
- Optimize for 2G/3G loading performance.
- All prices in GHC (Ghana Cedis).
- Use ShadCN UI for all components.
- Persist data locally for offline view support.
- Use `.env` config for API keys.
- Keep all modules AI-editable and split into logical files.
