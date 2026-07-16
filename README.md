# RepoPulse

Discover rising and popular GitHub repositories through stars, forks, activity, and growth trends.

RepoPulse is an open-source repository discovery dashboard. It tracks public repository snapshots over time so developers can compare daily, weekly, and monthly momentum instead of relying only on lifetime star totals.

![RepoPulse desktop design concept](docs/design/repo-pulse-desktop-concept.png)

## What it includes

- Daily, weekly, and monthly ranking views
- Star growth, fork growth, and explainable momentum sorting
- Repository search, language filters, and topic filters
- Responsive desktop and mobile layouts
- URL-backed filters for shareable views
- Supabase schema with RLS and indexed snapshot queries
- GitHub Actions collection every six hours
- A clearly labeled sample-data fallback before Supabase is configured

## Architecture

```text
GitHub Actions + short-lived GITHUB_TOKEN
                ↓
         GitHub public REST API
                ↓
     Supabase repositories + snapshots
                ↓
      Next.js Server Components
                ↓
             Vercel
```

The browser never receives a GitHub token or Supabase service-role key. See [docs/architecture.md](docs/architecture.md) for the security and data-flow details.

## Local development

Requirements:

- Node.js 24
- npm

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without Supabase environment variables, the application intentionally renders a labeled sample dataset so UI work and deployments remain testable.

## Supabase setup

1. Create a Supabase project.
2. Apply [`supabase/migrations/202607160001_initial_schema.sql`](supabase/migrations/202607160001_initial_schema.sql).
3. Copy `.env.example` to `.env.local` and provide the public project URL and anon key.
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub Actions repository secrets.

Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

GitHub Actions secrets:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`GITHUB_TOKEN` is generated automatically for each Actions job. Do not create a personal token for the MVP collector.

## Data collection

Run the collector locally only after setting the required environment variables:

```bash
npm run collect
```

The collector discovers a bounded candidate pool through GitHub Search, deduplicates repositories, performs batch upserts, and records one snapshot per repository per hour. The scheduled workflow runs every six hours and safely skips collection until Supabase secrets exist.

## Ranking caveat

GitHub does not provide an API field for arbitrary “stars gained in the last seven days.” RepoPulse calculates growth from its own snapshots. Until enough history exists, the site must describe rankings as covering tracked repositories and the period available since tracking began.

See [docs/methodology.md](docs/methodology.md) for the first ranking formula and known biases.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run check
npm run collect
```

## Deployment

Deploy the Next.js application to Vercel and connect the `main` branch. The frontend reads only public ranking data from Supabase. Collection remains isolated in GitHub Actions.

## License

[MIT](LICENSE)
