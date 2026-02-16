# Swiss {ai} Weeks — Events

The definitive source of AI events in Switzerland. A Hugo static site deployed on Vercel, with event data stored as Markdown/YAML content files.

## Architecture

**JAMstack**: Hugo (SSG) + Vercel Functions (API) + GitHub (data store)

| Component | Technology | Directory |
|-----------|-----------|-----------|
| Public website | Hugo static site | `layouts/`, `content/`, `static/` |
| Admin panel | React + TypeScript + Tailwind | `admin/` |
| Serverless API | Vercel Functions | `api/` |
| Event data | Markdown + YAML frontmatter | `content/events/` |
| Build | Custom build script | `build.sh` |

## Repository Structure

```
AI-events/
  admin/           # React admin panel (GitHub OAuth, event CRUD)
  api/             # Vercel serverless functions
  archetypes/      # Hugo content templates
  content/events/  # Event data (YAML frontmatter + Markdown)
  layouts/         # Hugo templates (HTML, JSON, RSS)
  static/          # Static assets (robots.txt, images)
  specifications/  # Technical documentation
  pm/              # Project management docs
  build.sh         # Vercel build script
  hugo.toml        # Hugo configuration
  vercel.json      # Vercel deployment config
```

## Quick Start

### Prerequisites

- [Hugo](https://gohugo.io/installation/) v0.155.3+ (extended edition)
- [Node.js](https://nodejs.org/) v18+
- A GitHub account (for admin panel OAuth)

### Local Development

```bash
# Hugo site (public website)
hugo server -D          # http://localhost:1313

# Admin panel
cd admin
npm install
npm run dev             # http://localhost:5173
```

### Production Build

```bash
hugo --minify           # Build Hugo site to public/

# Or full build (Hugo + admin panel)
./build.sh
```

## Content Model

Events are stored as Hugo content files at `content/events/{year}/{month}/{day}/{uuid}.md`.

Each event has YAML frontmatter with fields following schema.org naming conventions. See `specifications/event-schema.md` for the full field reference.

### Status Lifecycle

```
draft -> review -> pending -> approved -> published -> archived
```

## Deployment

### Vercel

The site deploys automatically via Vercel:

- **Production**: Push to `main` triggers production deployment
- **Preview**: Pull requests get preview deployments
- **Build command**: `./build.sh` (installs Hugo, builds site + admin panel)
- **Output directory**: `public/`
- **Domain**: `ai-weeks.ch/events` (production)

### Environment Variables

Configure these in Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret | Yes |
| `HUGO_ENV` | Hugo environment (`production`) | No |
| `VERCEL_PROJECT_PRODUCTION_URL` | Auto-set by Vercel for `--baseURL` | Auto |

### URL Routing

| Path | Destination |
|------|-------------|
| `/events/*` | Hugo-generated static pages |
| `/admin/*` | React admin panel SPA |
| `/api/*` | Vercel serverless functions |

## Admin Panel

The admin panel at `/admin/` provides:

- GitHub OAuth authentication
- Event list with search, filtering, and sorting
- Event detail view and editing
- Status workflow controls (draft -> published)
- Bulk status updates
- Dashboard with stats and duplicate detection
- Event history tracking

### Running Tests

```bash
cd admin
npm run test:run        # Run all tests
npm run test:coverage   # Run with coverage report (80% threshold)
npm run lint            # ESLint check
npm run build           # TypeScript check + production build
```

## License

- **Source code**: [Apache License 2.0](LICENSE)
- **Event data**: [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)
