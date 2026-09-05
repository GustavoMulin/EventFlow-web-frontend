# EventFlow SPA (frontend)

Vue 3 + Vite single-page app for EventFlow. Talks to the Laravel API
(`../EventFlow-web-back`) over JSON using a **Sanctum bearer token** kept in
`localStorage`.

## Stack

- Vue 3 (`<script setup>`, JavaScript), Vue Router, Pinia
- Vite 8, Tailwind CSS v4
- axios (`src/lib/api.js`) — injects the bearer token, funnels 401s to a logout
- ESLint + oxlint + Prettier

## Setup

```sh
npm install
cp .env.example .env          # set VITE_API_URL (default http://localhost:8000)
npm run dev                   # http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | oxlint + eslint (autofix) |
| `npm run format` | Prettier over `src/` |

## Structure

```
src/
  lib/api.js            axios instance + error helpers
  stores/auth.js        Pinia auth store (token, user, login/register/2FA/...)
  router/index.js       routes + requiresAuth / guestOnly navigation guards
  layouts/              GuestLayout (auth pages), AppLayout (nav + logout)
  components/ui/         UiButton, UiField, UiAlert, UiCard
  views/
    auth/               Login, Register, ForgotPassword, ResetPassword, VerifyEmail
    settings/           Profile (update / delete), Security (password / 2FA)
    DashboardView.vue   authenticated landing — build EventFlow features here
```

The API contract is documented in `../EventFlow-web-back/README.md`.
