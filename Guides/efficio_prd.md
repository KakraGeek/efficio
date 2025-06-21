# Efficio Product Requirements Document (PRD)

## Elevator Pitch

Efficio is a mobile-first business management app designed for Ghanaian fashion artisans. It helps streamline order management, payments, inventory, and client tracking—replacing paper-based processes with smart, low-data digital tools optimized for local conditions.

## Problem Statement

Fashion artisans in Ghana struggle with tracking client orders, managing inventory, and reconciling payments—often resulting in lost revenue and missed deadlines. Most rely on paper-based processes, which are inefficient and prone to error.

## Target Audience

- Tailors, fashion designers, shoemakers, seamstresses in Ghana and similar emerging markets
- Typically solo entrepreneurs or small workshops

## USP

- Mobile-first offline-friendly app tailored for the unique business processes of local artisans
- Supports Mobile Money APIs and manual cash reconciliation
- Measurement capture, image attachments, SMS/WhatsApp notifications, and business insights

## Target Platforms

- Mobile (PWA with offline support)
- Web (desktop for full access)

## Features List

### Core Authentication & Access Control

- [x] As a user, I want to sign up and log in securely with email or phone.
- [x] Single-user access per subscription; no team collaboration in V1.
- [x] Role-based control is future-proofed but disabled in V1.

### Client Management Module

- [x] As an artisan, I want to capture full client details, including measurements.
- [x] Use all known standard measurement fields for clothing.
- [x] View client order and payment history.

### Inventory Management Module

- [x] As a user, I want to track fabrics, accessories, and raw materials.
- [x] Alerts for low-stock and reordering suggestions.

### Order & Workflow Management

- [x] As a user, I want to create and manage orders, assign due dates, and track status.
- [x] Upload reference images (JPG/PNG) and PDFs to orders.
- [x] Add extended notes or custom requirements.
- [x] Orders are linked to clients and inventory consumed.

### Payment Integration

- [x] As an artisan, I want to accept payments via Mobile Money and cash.
- [x] Integrate MTN MoMo, AirtelTigo Cash, Telecel Cash (direct APIs).
- [x] Manual cash entry with reconciliation.
- [x] Payment receipts stored and linked to orders.

### Reports & Notifications

- [x] Notify clients via WhatsApp and SMS (preferred); email as fallback.
- [x] Templates for “Order Ready”, “Payment Received”.
- [x] Daily/weekly summary reports via email.

### Settings & Configuration

- [x] Edit business name, contact info, MoMo wallet, currency display (GHC).
- [x] Enable/disable notifications and channels.

### UX/UI Considerations

- [x] Mobile-first responsive design (Tailwind + ShadCN UI).
- [x] Offline UI states for no-data environments.
- [x] Visual hierarchy and progressive disclosure for low literacy support.
- [x] GHC (Ghana Cedis) for all pricing and financial display.
- [x] Language: English only for V1.

### Technical Architecture Requirements

- [x] Frontend: Next.js + Tailwind CSS + ShadCN UI
- [x] Backend: tRPC, Drizzle ORM, Neon PostgreSQL
- [x] Auth: Clerk
- [x] Storage: Cloud-prep for uploads (e.g., Supabase/Blob)
- [x] Notifications: Twilio (SMS), WhatsApp API (via BSP), Clerk/Resend (email)
- [x] Deployment: Vercel + edge functions
- [x] PWA with IndexedDB/localStorage for offline mode

### Non-Functional Requirements

- [x] Works reliably on 2G/3G networks
- [x] Sub-500ms API response times
- [x] 95%+ uptime for payment operations
- [x] Data privacy and secure auth (Clerk + HTTPS only)
- [x] Offline: view orders, clients, and payments in read-only mode

## Monetization Strategy

- Essentials (Free): Basic CRM, inventory alerts
- Plus (GHC 120/mo): Inventory + Mobile Money Payments
- Premium (GHC 300/mo): Reports, analytics, card payment options

## Technical Stack Specification

- **Frontend:** Next.js, Tailwind CSS, ShadCN UI, PWA capabilities
- **Backend:** tRPC, Drizzle ORM, PostgreSQL (Neon)
- **Auth:** Clerk
- **Payments:** MTN, AirtelTigo, Telecel (direct API)
- **Notifications:** WhatsApp API, SMS via Twilio or Hubtel, Clerk for email
- **Storage:** Vercel Blob/Supabase future prep
- **Deployment:** Vercel (edge optimized)

## Development Phases & Milestones

1. **Phase 1** - Core CRM + Auth + UI (2 weeks)
2. **Phase 2** - Orders + Inventory (2 weeks)
3. **Phase 3** - Payments + Notifications (3 weeks)
4. **Phase 4** - Reports + Offline + Polish (2 weeks)
5. **Phase 5** - Subscription + Launch (1 week)

## Critical Questions or Clarifications

All major items confirmed. Ready to build.
