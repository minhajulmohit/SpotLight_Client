# SpotLight

Live website: https://spotlight-client.vercel.app

## Features

- Browse studio listings and explore featured spaces by category.
- View studio details, pricing, amenities, and host information.
- Register with email and password or sign in with Google.
- Create, update, and delete your own studio listings.
- Request bookings, check time-slot availability, and manage booking status.
- Protect listing and booking actions with authenticated, HTTPOnly-cookie-based JWT authorization.
- Switch between light and dark themes.

## Tech Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Better Auth with MongoDB and Google OAuth
- Express.js, MongoDB, and JWT authorization
- Swiper, Sonner, and ImgBB

## Local Setup

Assuming `spotlight_client` and `spotlight_server` are in the same parent folder, install dependencies in each:

```bash
cd spotlight_client
npm install
```

2. Create `spotlight_client/.env.local` with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=your_random_secret
   NEXT_PUBLIC_API_URL=http://localhost:8000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
   ```

3. From the shared parent folder, start the server and client in separate terminals:

   ```bash
   cd spotlight_client
   npm run dev
   ```

   Open http://localhost:3000.

## Examiner Test Credentials

| Role           | Email                         | Password         |
| -------------- | ----------------------------- | ---------------- |
| Host / Creator | `examiner.test@spotlight.com` | `Spotlight2026!` |
| Demo User      | `creator.guest@spotlight.com` | `Creative2026!`  |

