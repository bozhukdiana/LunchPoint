# LunchPoint

School meal attendance management for Ліцей №1 м. Копичинці.

## Development

1. Copy `.env.example` to `.env.local` and supply all Firebase web configuration values from your Firebase Console project settings.
2. Install dependencies with `npm install`.
3. Start the local server with `npm run dev`.

## Current status

- **Auth** — Google Sign-In, role-aware routing (student / teacher / admin), activation-pending flow.
- **Admin module** — Dashboard overview, Users, Classes, School Years, Settings, Audit Log, and Reports pages with full Firestore-backed data layer.
