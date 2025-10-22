# CleanOpsAI Demo App (Next.js + Supabase)

This demo app handles marketing → auth → protected dashboard. The public marketing site will be built in Webflow; you can embed parts of this app in Webflow (iframe) or run it at a subdomain.

## 1) Setup

1. Create a Supabase project and copy the **Project URL** and **anon** API key.
2. Create `.env.local` from the example:

```
cp .env.example .env.local
```

Then fill the values:

```
NEXT_PUBLIC_SUPABASE_URL=... 
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Install & run:

```bash
npm i
npm run dev
# or: pnpm i && pnpm dev
```

Open http://localhost:3000

## 2) Auth
- Email/password out of the box. Configure magic links/social providers in Supabase if desired.
- Server-side protection: `app/dashboard/page.tsx` checks session and redirects if no user.

## 3) Next steps
- Replace the placeholder marketing page with a Webflow site, and link **Sign in**/**Start free** to these routes.
- Flesh out the **DemoTabs** with real data or mocked scenarios.
- Add role-based access and org/team models.
- Add database tables for jobs, staff, mileage, wages (via Supabase SQL) when ready.
