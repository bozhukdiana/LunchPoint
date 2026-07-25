# LunchPoint

Система обліку харчування учнів.

## Authentication module

Implemented authentication flow:

- Firebase Google sign-in
- Sign out
- SessionProvider + AuthContext
- Role detection from Firestore `users/{uid}`
- Protected routes
- Public-only route
- Role guard (`admin`, `teacher`, `student`)
- Access gate messages for inactive or not-yet-activated accounts

## Routing behavior

- `/signin` — public sign-in page
- `/auth-gate` — activation/role resolution screen
- `/` — admin area
- `/teacher` — teacher area
- `/student` — student area

If `users/{uid}` does not exist:

`Ваш акаунт ще не активовано адміністратором.`

If `users/{uid}.active === false`:

`Ваш акаунт деактивовано.`

## Environment variables

Create a `.env` file using `.env.example` values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
