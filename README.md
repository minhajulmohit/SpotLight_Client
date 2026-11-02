# SpotLight — Peer-to-Peer Creative Workspace & Production Studio Sharing Platform

> **Live Website:** [https://spotlight-client.vercel.app](https://spotlight-client.vercel.app)  
> **Server API:** [https://spotlightserver.vercel.app](https://spotlightserver.vercel.app)

---

## 📌 Project Overview
**SpotLight** is a high-performance peer-to-peer marketplace designed for creators, filmmakers, photographers, poetasters, and musicians. Studio owners and hosts can list their creative spaces—ranging from photography cyc walls and cinema sound stages to podcast lounges, music recording suites, and art workshops. Fellow creators can discover, filter, inspect dynamic availability, and reserve studio slots with transparent pricing and real-time booking management.

---

## 🚀 Key Features

* **Dynamic Studio Discovery & Filtering:** Browse production-ready spaces with real-time multi-criteria filtering by category (Photo Studio, Sound Stage, Film Stage, Podcast Lounge, Music Suite, Art Workshop), maximum hourly rate, minimum rating, and text search with instant URL query param synchronization.
* **Complete Studio Management (CRUD):** Authenticated hosts can list new creative studios with ImgBB image uploading (banner + multi-image gallery carousel), manage their own listings via `/my-listings`, update workspace specs, and delete with interactive confirmation modals.
* **JWT-Protected Mutations (Challenge 1):** Better Auth's JWT plugin issues a signed **EdDSA** token from the active session, and every protected Express request carries it as `Authorization: Bearer <jwt>`. The API verifies the signature against Better Auth's JWKS endpoint. Missing or invalid tokens receive `401 Unauthorized`, and non-owners receive `403 Forbidden`.
* **Conflict-Free Booking System with Double-Booking Prevention:** Interactive booking modal with automatic hour and price calculation. Backend algorithm prevents overlapping reservations on identical time slots (returning HTTP 409 conflict).
* **Host Guarantee & Creator Support (Platform Assurances):** Integrated trust framework covering $1M liability protection, verified creator/host profiles, equipment safety protocols, and 24/7 dedicated support.
* **Downloadable PDF Booking Invoices:** Official receipts generated client-side with **jsPDF** — studio/host breakdown, schedule, hourly rate math, deposit and total — downloaded as `spotlight-invoice-<id>.pdf` without opening the browser print dialog.
* **Comprehensive Light / Dark Theme Customization:** Instant toggle between light and dark modes with persisted user preference across all components, forms, and dialogs.
* **Custom Creative 404 Experience:** Branded "Scene Not Found" error page with creative spotlight illustration and instant navigation back to the workspace catalog.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Swiper 14 (hero slider), jsPDF (invoice export), Lucide React, Sonner Toast
* **Authentication:** BetterAuth with MongoDB Adapter, persistent session storage, Google OAuth support, JWT plugin (EdDSA tokens verified by the Express API through JWKS)
* **Backend:** Node.js, Express.js, MongoDB Atlas (Native Driver), CORS, dotenv
* **Media Storage:** ImgBB Cloud API integration for direct photo uploads

---

## 💻 Local Setup Steps

### 1. Prerequisites
* Node.js v20+ installed
* Git installed

### 2. Clone the Repositories
```bash
# Clone Client
git clone https://github.com/minhajulmohit/SpotLight_Client.git
cd SpotLight_Client
npm install
```

```bash
# In a separate terminal, clone Server
git clone https://github.com/minhajulmohit/SpotLight_Server.git
cd SpotLight_Server
npm install
```

### 3. Environment Variables
Create a `.env` file in `spotlight_client/`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_IMGBB_API_KEY=c0379965d83626fa323fcf63e9f0298a
```

Create a `.env` file in `spotlight_server/`:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=8000
CLIENT_URL=http://localhost:3000
```
> `CLIENT_URL` must exactly match the client's `BETTER_AUTH_URL`; Express uses it for CORS and to verify the JWT issuer/audience. Browser API requests go through the same-origin Next.js proxy, which reads `NEXT_PUBLIC_API_URL` server-side and forwards the JWT without exposing it to browser JavaScript.

### 4. Run Development Servers
```bash
# Run server
cd spotlight_server
npm run dev

# Run client (in another terminal)
cd spotlight_client
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Examiner Test Credentials

Use these credentials to test host actions, private routes, and bookings:

| Role | Email | Password |
|---|---|---|
| **Host / Creator** | `examiner.test@spotlight.com` | `Spotlight2026!` |
| **Demo User** | `creator.guest@spotlight.com` | `Creative2026!` |

> *Note: You can also register a new account anytime with valid password validation (at least 6 characters, 1 uppercase, 1 lowercase letter).*
