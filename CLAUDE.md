# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swiss {ai} Weeks Events Application — the definitive source of AI events in Switzerland. A Hugo static site deployed on Vercel, with event data stored as Markdown/YAML content files in this Git repository. The full specification lives in `pm/SaiW26 Events App Specification v1 16 Feb 26.md`.

## Build & Development Commands

```bash
hugo server              # Local dev server (http://localhost:1313)
hugo server -D           # Include draft content
hugo --minify            # Production build (Vercel build command)
```

Output directory: `public/`

## Architecture

**JAMstack**: Hugo (SSG) + Vercel Functions (API) + GitHub (data store)

- **Content files**: `content/events/{year}/{month}/{day}/{event_id}.md` — YAML frontmatter + Markdown body
- **Serverless API**: `/api/` directory — Vercel Functions for form submissions, partner API, email notifications
- **Admin panel**: Separate web application with GitHub OAuth authentication
- **Deployment**: Vercel auto-deploys on push to `main`; PRs get preview deployments
- **Domain**: `ai-weeks.ch/events`
- **Reference implementation**: [massalia.events](https://github.com/jstuker/massalia.events) — built with Claude Code, use as pattern reference

## Data Model

Events are Hugo content files with YAML frontmatter. Key conventions:

- File path encodes start date: `content/events/2026/09/17/{uuid}.md`
- UUID-based `event_id` for each event
- Field names follow schema.org naming where applicable (e.g. `event_name` maps to schema.org `name`)
- Price fields: `event_price_type` (free/paid/range) determines which price fields apply
- Status lifecycle: `draft` → `review` → `pending` → `approved` → `published` → `archived`
- Internal metadata (`event_id`, `status`, `created_at`, `updated_at`, `source`) is system-managed, not organizer-submitted
- `featured` and `featured_type` control visual prominence for paying partners
- Every event **must** have a `date` field matching `event_start_date` — Hugo uses `date` for permalink `:year/:month/:day` tokens and for future-content gating
- Every event **must** have a `slug` field — an ASCII-only, lowercase, hyphenated version of the event title (no diacritics, unicode, or `%` in URLs). Permalinks use `:slug`, e.g. `/events/2026/09/17/zurich-ai-hackathon-2026/`

## Key Technical Requirements

- **schema.org compliance**: JSON-LD structured data on every event page
- **SEO**: sitemap.xml, robots.txt, OpenGraph + Twitter Card meta tags
- **Multilingual**: Support de/fr/it/en via separate content files per language (English first)
- **Client-side**: JavaScript for search, filtering by date/location/category/language
- **Data exports**: JSON and RSS with configurable filters
- **Licence**: Event data CC-BY 4.0, source code Apache 2.0

## Implementation Phases

1. **Phase 1 (MVP)**: Hugo project structure, content types, sample data, admin panel, CI/CD
2. **Phase 2**: Public website templates, search/filtering, featured events, responsive design, SEO
3. **Phase 3**: Submission web form, Vercel Functions API, validation, email notifications
4. **Phase 4**: Data exports (JSON/RSS), embeddable widget, analytics, data quality automation

## Hugo Configuration

- Config file: `hugo.toml`
- Base URL: `https://jstuker.github.io/AI-events/` (will change to `ai-weeks.ch/events` for production)
- Hugo version: v0.155.3+extended+withdeploy
- `buildFuture = true` is required since events are inherently future-dated
- Taxonomies: `tags`, `locations` (from `location_name`), `organizers` (from `organizer_name`)
- Output formats: HTML, RSS, JSON for home and section pages
