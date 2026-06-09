---
name: Clerk Replit Wiring
description: Correct wiring for Replit-managed Clerk in React+Vite + Express apps — avoids broken auth and load errors.
---

## Rules (copy verbatim, do not deviate)

**Frontend (App.tsx):**
- `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)` from `@clerk/react/internal`
- `clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL` — empty in dev (intentional), auto-set in prod. Never hardcode `/api/__clerk`.
- Wrap app in `<WouterRouter base={basePath}>` then `<ClerkProvider proxyUrl={clerkProxyUrl} routerPush/routerReplace>` inside
- Routes MUST be `/sign-in/*?` and `/sign-up/*?` — the `/*?` optional wildcard is the only pattern that handles Clerk's OAuth sub-paths
- `<SignIn path={`${basePath}/sign-in`}>` — full path required, Clerk reads window.location.pathname directly
- Do NOT use `setAuthTokenGetter` in web apps — cookie-based auth, not bearer tokens
- Use `<Show when="signed-in">` / `<Show when="signed-out">` from `@clerk/react` for conditional rendering
- Do NOT use `<UserButton />` — not customizable, exposes confusing Clerk-level options

**Backend (app.ts):**
- Mount `clerkProxyMiddleware()` BEFORE body parsers (it streams raw bytes)
- `clerkMiddleware()` from `@clerk/express` — no arguments needed when using env vars
- Do NOT use `publishableKeyFromHost` on the server side with @clerk/shared v3+

**CSS (index.css):**
- `@layer theme, base, clerk, components, utilities;` must come BEFORE `@import "tailwindcss"`

**Vite (vite.config.ts):**
- `tailwindcss({ optimize: false })` — required to prevent @clerk/themes CSS layer reordering in prod

**Why:** Replit-managed Clerk uses a custom proxy system. The proxy URL is empty in dev (Clerk hits dev FAPI directly) and auto-populated in prod. Any deviation from this pattern causes "Failed to load Clerk JS" errors.

**How to apply:** Every time Clerk is set up or modified in a React+Vite + Express project on Replit, follow these rules exactly.
