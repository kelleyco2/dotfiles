---
name: nextjs-conventions
description: Cooper's conventions for building Next.js apps — App Router, Tailwind v4, custom UI (no shadcn), GSAP, server actions, ESLint. Use when writing or editing any Next.js / React / TypeScript code, scaffolding components, styling with Tailwind, adding animations, or wiring data mutations in a Next project.
---

# Next.js conventions

Apply these unless a project's own `CLAUDE.md` or existing code says otherwise. When in doubt,
read a few neighboring files first and match them.

## Framework
- **Next 16, React 19, TypeScript strict, App Router.** Server Components by default; add
  `"use client"` only when a component needs interactivity, browser APIs, or hooks.
- Import alias is `@/*` → `src/*`. Use it; don't write long relative paths.
- Prefer **server actions** for mutations over route handlers or any RPC layer. No tRPC, no
  `@tanstack/react-query` unless the repo already uses it.

## Styling — Tailwind v4
- Tailwind is **v4**, configured in CSS with `@theme` / `@import "tailwindcss"`. There is **no
  `tailwind.config.js`** — do not create one, and don't use v3-era patterns (`theme.extend`
  in JS, `@tailwind base/components/utilities`).
- Define design tokens as CSS variables inside `@theme`. Read the project's globals CSS first.

## UI components
- **Build custom primitives in `src/components/ui/`. Do NOT install or scaffold shadcn/ui,
  Radix, or a component library.** There is no `components.json`.
- Icons come from **lucide-react**.
- A `cn()` helper (clsx + tailwind-merge) may exist; check before assuming — not every repo
  has one.

## Animation
- **GSAP + @gsap/react** is the default animation tool (use `useGSAP()`), with ScrollTrigger
  for scroll-driven motion. framer-motion appears in a couple repos — match what's there.

## Data / services
- ORM, when present, is **Drizzle**; some repos use raw `pg` or Sanity. Don't assume Prisma.
- Transactional email is usually **SendGrid**. Auth, when present, is **NextAuth v5 (beta)** —
  but most marketing/admin apps have none.

## Tooling
- Lint/format with **ESLint** (`eslint-config-next`). **Not Biome.** Run the repo's lint + the
  build (or `vitest`) before declaring done.
- Package manager is usually npm (a couple repos use yarn) — check the lockfile.

## Version note
Next 16, React 19, and Tailwind v4 postdate the training cutoff. For current API specifics,
use the **context7** plugin rather than relying on memory.
