---
name: Clerk Package Versions
description: Breaking changes between Clerk package versions relevant to Replit projects.
---

## @clerk/shared v3+ (breaking change from v2)

- `publishableKeyFromHost` was REMOVED from `@clerk/shared/keys` in v3+
- Use `publishableKeyFromHost` from `@clerk/react/internal` on the client side instead
- On the server side with @clerk/express, just use `clerkMiddleware()` with no arguments — reads `CLERK_PUBLISHABLE_KEY` env var automatically

## @clerk/react v4 → v6 (major upgrade)

- The package version in pnpm workspace was pinned to `^4.30.0` by the design subagent scaffold; must be updated to `^6.7.3` or newer
- v6 introduces `publishableKeyFromHost` from `@clerk/react/internal`
- v6 uses `Show` component (not `SignedIn`/`SignedOut` wrappers)

**Why:** These version mismatches cause silent failures or runtime crashes that are hard to diagnose.

**How to apply:** When installing @clerk packages, verify versions match. After install, check `node_modules/@clerk/react/package.json` to confirm actual installed version.
