# Swiss {ai} Weeks — Events Application Technical Specification

**For Claude Code Implementation**
**Version 1.0 — 16 February 2026**

---

## 1. Project Overview

### 1.1 Mission

The Swiss {ai} Weeks events app is the definitive source of all AI events information in Switzerland.

### 1.2 Goals

- Build a comprehensive datastore of all relevant AI events in Switzerland, collected from community organizers and partner initiatives.
- Publish events in a visually attractive, semantically rich format (schema.org compliant) that can be integrated into the SaiW website and partner platforms (e.g. Kickstart website or newsletter).
- Achieve top rankings for AI crawlers and search engines looking for AI events in Switzerland through semantic richness and structured data.
- Serve as the canonical data source for anyone communicating about AI events (newsletters, media), published under CC-BY 4.0 licence.
- Allow paying partners to highlight their events with visual prominence and positioning boosts.
- Enable the SaiW team to maintain relationships with all organizers and understand event reach through analytics.
- Build and share the project using open source tools and an AI-first development approach.

### 1.3 Licence

All event data published under Creative Commons BY 4.0. Source code open source.

---

## 2. Technology Stack

### 2.1 Architecture Overview

The application is a static site generated with Hugo, with event data stored as content files in a GitHub repository. GitHub serves as the **collaboration platform and single source of truth** for all event data. The site is built and deployed via **Vercel**, which connects to the GitHub repository and automatically rebuilds on every push. A custom admin panel provides editorial workflow. Submission is via web forms and a programmatic API.

### 2.2 Technology Choices

| Component | Choice | Notes |
|---|---|---|
| Static site generator | Hugo | |
| Data storage | Markdown/YAML content files in GitHub repository | Git-based, version-controlled |
| Collaboration & source of truth | GitHub | Repository holds all event data, PRs for contributions, Issues for coordination |
| Admin panel | Separate web application with GitHub OAuth authentication | Decided |
| Frontend interactivity | JavaScript | Client-side search, filtering, and navigation |
| Hosting & deployment | **Vercel** | Automatic builds on push to GitHub; global edge network, preview deployments per PR |
| Serverless functions | **Vercel Functions** | API routes for form submissions, partner API, and email notifications |
| Languages | Multilingual support: de, fr, it, en (separate content files per language; starting with English only) | Decided |
| Schema compliance | schema.org Event specification as baseline | |
| Reference implementation | [github.com/jstuker/massalia.events](https://github.com/jstuker/massalia.events) | Built entirely with Claude Code |
| Image storage | GitHub repository (migrate to CDN if repo size becomes an issue) | Decided |
| Analytics | Google Analytics | Decided |
| Authentication | GitHub OAuth for admin panel | Decided |

### 2.3 Vercel Deployment Details

- **Build command:** `hugo --minify`
- **Output directory:** `public/`
- **Framework preset:** Hugo
- **Preview deployments:** Every pull request gets a unique preview URL for review before merging.
- **Production deployment:** Automatic on push to `main` branch.
- **Serverless functions:** Located in `/api/` directory, used for form handling, partner API endpoints, and email notifications via SMTP (Google Workspace).
- **Environment variables:** API keys, SMTP credentials, and GitHub tokens stored securely in Vercel project settings (never in the repository).
- **Custom domain:** `ai-weeks.ch` configured via Vercel DNS settings with automatic SSL.
- **Application directory:** the events applications runs under `ai-weeks.ch/events`

### 2.4 GitHub as Collaboration Platform

GitHub remains central to the project — not as a hosting platform, but as:

- **Single source of truth:** All event data lives in the repository as Markdown/YAML files.
- **Collaboration hub:** Community contributions via pull requests, editorial coordination via issues.
- **Version control:** Full audit trail of every event change.
- **CI triggers:** Every push to the repository triggers a Vercel build and deployment.
- **AI-compatible:** Claude Code can directly read/write event files in the repository.

### 2.5 Open Technology Decisions

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | Admin panel framework (React, Vue, plain JS, or Hugo-based?) | P0 | DECIDED: Separate app |
| 2 | Hosting platform | P1 | **DECIDED: Vercel** |
| 3 | API middleware for programmatic submissions | P1 | **DECIDED: Vercel Functions** |
| 4 | Authentication for admin panel | P1 | DECIDED: GitHub OAuth |
| 5 | Open source licence for code (MIT vs Apache 2.0) | P2 | **DECIDED: Apache 2.0** |
| 6 | Event category/tag taxonomy (awaiting definition from team) | P0 | TODO |

---

## 3. Data Model

### 3.1 Design Principles

- Superset of schema.org Event specification — all schema.org-mapped fields use schema.org naming conventions.
- Additional fields follow the same semantic style but are prefixed or clearly separated.
- Each event is a single Markdown file with YAML frontmatter in the Hugo content directory.
- File naming convention: `content/events/{year}/{month}/{day}/{event_id}.md` — organized by `start_date`

### 3.2 Event Fields (Organizer-Submitted)

M = mandatory, O = optional. schema.org column shows the corresponding schema.org property.

| ID | Req | Field name | schema.org | Type | Description |
|---|---|---|---|---|---|
| 1.1 | M | `contact_name` | — | Text | Contact person name |
| 1.2 | M | `contact_email` | — | Email | Contact person email |
| 1.3 | O | `contact_phone` | — | Phone | Contact person phone |
| 2.1 | M | `event_name` | `name` | Text | Event title |
| 2.2 | M | `event_description` | `description` | Text | Event description |
| 2.3 | M | `event_url` | `offers.url` | URL | Ticketing / registration URL |
| 2.4 | M | `event_start_date` | `startDate` | ISO-8601 | Start date+time (Zurich TZ) |
| 2.5 | M | `event_end_date` | `endDate` | ISO-8601 | End date+time (Zurich TZ) |
| 2.6 | O | `event_price_type` | — | Enum | `free`, `paid`, `range` |
| 2.7 | O | `event_price` | `offers.price` | Number | Fixed ticket price (when `price_type` = `paid`) |
| 2.8 | O | `event_price_currency` | `offers.priceCurrency` | Text | ISO 4217 currency code, e.g. `CHF`, `EUR` (required when `price` is set) |
| 2.9 | O | `event_low_price` | `offers.lowPrice` | Number | Lowest ticket price (when `price_type` = `range`) |
| 2.10 | O | `event_high_price` | `offers.highPrice` | Number | Highest ticket price (when `price_type` = `range`) |
| 2.11 | O | `event_price_availability` | `offers.availability` | Enum | schema.org Availability: `InStock`, `SoldOut`, `PreOrder` |
| 2.12 | O | `event_image_1x1` | `image` | URL/path | Square image (min 720px, rec 1920px) |
| 2.13 | O | `event_image_16x9` | `image` | URL/path | Widescreen image (min 720px, rec 1920px) |
| 2.14 | O | `event_language` | — | List | de, fr, it, en (multi-select) |
| 2.15 | O | `event_attendance_mode` | `eventAttendanceMode` | Enum | presence, online, hybrid |
| 2.16 | O | `event_target_audience` | — | Text | Target audience description |
| 3.1 | M | `location_name` | `location.name` | Text | Venue name |
| 3.2 | M | `location_address` | `location.address` | PostalAddress | Full street address |
| 3.3 | O | `organizer_name` | `organizer.name` | Text | Organizer name |
| 3.4 | O | `organizer_url` | `organizer.url` | URL | Organizer website |

### 3.3 Internal Metadata (System-Managed)

These fields are managed by the system and editorial team, not submitted by organizers.

| ID | Req | Field name | Type | Description |
|---|---|---|---|---|
| 4.1 | Auto | `event_id` | UUID | Unique event identifier (auto-generated) |
| 4.2 | M | `source` | Text | Submission source (form, api, manual, partner name) |
| 4.3 | O | `publication_channels` | List | Target channels: saiw, kickstart, etc. |
| 4.4 | O | `featured` | Boolean/Text | Highlight for paying partners |
| 4.5 | O | `featured_type` | Enum | How it is highlighted: badge, accent border, larger card, position boost |
| 4.6 | O | `tags` | List | Additional grouping/category tags |
| — | Auto | `created_at` | ISO-8601 | Submission timestamp |
| — | Auto | `updated_at` | ISO-8601 | Last modification timestamp |
| — | Auto | `status` | Enum | draft, review, pending, approved, published, archived |

### 3.4 Example Hugo Content File

`content/events/2026/09/17/550e8400-e29b-41d4-a716-446655440000.md`:

```yaml
---
event_id: "550e8400-e29b-41d4-a716-446655440000"
event_name: "Zurich AI Hackathon 2026"
event_description: "A nationwide AI-focused hackathon..."
event_start_date: "2026-09-17T09:00:00+02:00"
event_end_date: "2026-09-17T18:00:00+02:00"
event_url: "https://example.com/register"
event_price_type: "range"
event_price_currency: "CHF"
event_low_price: 50
event_high_price: 150
event_price_availability: "InStock"
location_name: "Kraftwerk"
location_address: "Selnaustrasse 25, 8001 Zürich"
organizer_name: "Swiss {ai} Weeks"
organizer_url: "https://swiss-ai-weeks.ch/"
event_attendance_mode: "presence"
event_language: ["de", "en"]
event_image_1x1: "/images/events/hackathon-1x1.jpg"
contact_name: "Jürg Stuker"
contact_email: "juerg@example.com"
source: "form"
status: "published"
featured: true
featured_type: "badge"
tags: ["hackathon", "networking"]
publication_channels: ["saiw", "kickstart"]
created_at: "2026-02-16T10:00:00+01:00"
updated_at: "2026-02-16T14:30:00+01:00"
---

Full markdown description of the event goes here...
```

---

## 4. System Components

### 4.1 Component 1: Events Data Store

The data store is a GitHub repository containing Hugo content files. Each event is a Markdown file with YAML frontmatter. GitHub is the single source of truth — Vercel reads from this repository to build and deploy the site.

#### 4.1.1 Requirements

- Git-based version control provides full audit trail of all changes.
- Easy for anyone to contribute via pull requests or the admin UI.
- Queryable via Hugo's built-in taxonomies and content management.
- Compatible with AI-assisted editing (Claude Code can directly read/write files).

#### 4.1.2 Editorial Workflow

Events move through a lifecycle managed by the `status` field:

- **draft:** Newly submitted, not visible on public site. Default state for all submissions.
- **review:** Flagged for team review (duplicate detection, quality check).
- **pending:** More information requested from submitting party
- **approved:** Reviewed and approved by team, ready for publication.
- **published:** Live on the website and available via data exports.
- **archived:** Past events or manually removed events.

#### 4.1.3 Data Quality Automation

- **Duplicate detection:** Flag events with similar name + date + location combinations.
- **Auto-archive:** Move events to `archived` status after `end_date` passes.
- **Validation:** Ensure mandatory fields are present and correctly formatted.
- **Typo/formatting cleanup:** Normalize dates, addresses, and common formatting issues.

#### 4.1.4 Automation

- Automated notification to organizers by mail (SMTP using Google Workspace of SaiW) about important status updates of their event. Email sending is handled by **Vercel Functions** calling the Google Workspace SMTP endpoint.

### 4.2 Component 2: Events Submission

#### 4.2.1 Web Form (Community Organizers)

- Public-facing form for event organizers to submit new events.
- Collects all mandatory fields plus optional fields from the data model.
- Form submission handled by a **Vercel Function** that validates data and commits a new content file in `draft` status to the GitHub repository.
- Sends confirmation to the organizer and notification to the SaiW team by mail (SMTP using Google Workspace of SaiW)
- Write a submissions log visible in the admin backend
- Interim solution: Google Form (until custom form is built).

#### 4.2.2 Programmatic API (Partners)

- RESTful API implemented as **Vercel Functions** for bulk event submission.
- Partners submit JSON payloads matching the data model schema.
- Authentication mechanism TBD (API keys, GitHub tokens, or OAuth).
- Validation and deduplication before committing to the repository.
- Include submissions via API in the submission log visible in the admin backend

#### 4.2.3 Manual Input (SaiW Team)

- Team members can create and edit events directly through the admin panel.
- Full access to all fields including internal metadata.

### 4.3 Component 3: Events Publication

#### 4.3.1 Website (ai-weeks.ch/events)

- Visually attractive event listing generated by Hugo as a static site, **deployed on Vercel's global edge network**.
- Client-side JavaScript for search, filtering (by date, location, category, language), and navigation.
- Individual event pages with full schema.org structured data (JSON-LD).
- Featured/highlighted events for paying partners: visual prominence (badge, accent border, larger card) and position boost (pinned to top of listings).
- Calendar view and list view options.
- Responsive design for mobile and desktop.
- Sharing buttons for social media platforms including metadata such as Twitter Card meta tags
- Embeddable widget/component for partner websites (e.g. Kickstart).
- **Preview deployments** on Vercel for every pull request, enabling editorial review before publishing.

#### 4.3.2 Data Export (Newsletters and Partners)

- Filtered data exports in JSON and/or RSS format.
- Configurable filters: date range, category, location, publication channel.
- Suitable for integration with newsletter tools (Mailchimp, etc.).
- Available as static files generated during Hugo build, or via **Vercel Functions** for dynamic queries.

#### 4.3.3 SEO and AI Discoverability

- Every event page includes schema.org Event structured data in JSON-LD format.
- Semantic HTML5 markup throughout.
- Sitemap.xml and robots.txt optimized for crawlers.
- Open Graph and Twitter Card meta tags for social sharing.
- Geographic scope: all of Switzerland, with location-based filtering.

### 4.4 Component 4: Admin Panel

A custom web application for the SaiW team to manage the event lifecycle. Deployed on **Vercel** alongside the main site (or as a separate Vercel project).

#### 4.4.1 Core Features

- Dashboard with overview stats: total events, pending review, published, submissions this week.
- Event list with search, sort, and filter capabilities.
- Event detail view with edit functionality for all fields.
- Status workflow controls: approve, reject, publish, archive, feature.
- Submission log view for debugging
- Duplicate detection alerts with merge/dismiss options.
- Organizer contact management.
- Basic analytics: events per period, page views per event, submission sources.

---

## 5. Implementation Phases (MVP First)

### 5.1 Phase 1: Data Model + Admin UI (MVP)

Priority: build the foundation. Get the data model right and give the team tools to manage events.

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | Set up Hugo project structure with content types and taxonomies | P0 | TODO |
| 2 | Define YAML frontmatter schema for event content files | P0 | TODO |
| 3 | Create sample/test event data (10-20 events) | P0 | TODO |
| 4 | Build admin panel: event list view with search and filters | P0 | TODO |
| 5 | Build admin panel: event detail/edit view | P0 | TODO |
| 6 | Build admin panel: status workflow (draft → review → pending → approved → published → archived) | P0 | TODO |
| 7 | Build admin panel: dashboard with basic stats | P1 | TODO |
| 8 | Implement duplicate detection logic | P1 | TODO |
| 9 | Set up GitHub repository structure and Vercel CI/CD | P0 | TODO |

### 5.2 Phase 2: Public Website

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | Design and build Hugo templates for event listing page | P0 | TODO |
| 2 | Build individual event page template with schema.org JSON-LD | P0 | TODO |
| 3 | Implement client-side search and filtering (JavaScript) | P0 | TODO |
| 4 | Featured events styling and positioning | P1 | TODO |
| 5 | Responsive design and mobile optimization | P1 | TODO |
| 6 | Allow for multilingual support (de, fr, it, en), but start with en only | P1 | TODO |
| 7 | SEO optimization (sitemap, meta tags, Open Graph) | P1 | TODO |
| 8 | Deploy to Vercel with custom domain (ai-weeks.ch) | P0 | TODO |

### 5.3 Phase 3: Submission System

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | Build public submission web form | P0 | TODO |
| 2 | Build Vercel Function to validate and commit submissions to GitHub | P0 | TODO |
| 3 | Form validation and confirmation flow | P0 | TODO |
| 4 | Programmatic API for partner submissions (Vercel Functions) | P1 | TODO |
| 5 | API authentication and rate limiting | P1 | TODO |
| 6 | Notification system (email via Vercel Functions + Google Workspace SMTP) | P2 | TODO |
| 7 | Partner onboarding documentation | P2 | TODO |

### 5.4 Phase 4: Data Export and Integration

| # | Task | Priority | Status |
|---|---|---|---|
| 1 | JSON data export with configurable filters | P1 | TODO |
| 2 | RSS feed generation | P1 | TODO |
| 3 | Embeddable widget for partner websites | P2 | TODO |
| 4 | Analytics integration | P2 | TODO |
| 5 | Automated data quality scripts (dedup, archive, validation) | P2 | TODO |

---

## 6. Open Questions and Decisions Needed

The following items still need to be resolved. Resolved decisions have been integrated into Section 2.2.

- **Event categories/tags taxonomy:** What is the official list of event types and topic categories? (Reference document in team folder)
- [RESOLVED] Admin panel technology: Separate application (integrated into Section 2.2)
- [RESOLVED] Hosting: **Vercel** (integrated into Section 2.2)
- [RESOLVED] API middleware: **Vercel Functions** (integrated into Section 2.2)
- [RESOLVED] Authentication: GitHub OAuth (integrated into Section 2.2)
- [RESOLVED] Image storage: GitHub repo (integrated into Section 2.2)
- [RESOLVED] Multilingual: Separate content files per language, English first (integrated into Section 2.2)
- [RESOLVED] Analytics: Google Analytics (integrated into Section 2.2)
- **Domain and SSL:** `ai-weeks.ch` DNS configured via **Vercel domain settings** with automatic SSL provisioning. Owner: Jürg (manual task)

### 6.1 Data Protection Note

The application collects personal data (contact name, email, phone) subject to the Swiss Data Protection Act (DPA) and EU GDPR. A privacy policy, data retention policy, consent mechanism, and data deletion process must be defined before launch. Details to be specified in a separate document.

### 6.2 Analytics Data Residency

Google Analytics stores data on US-based servers. This is an accepted exception to the Swiss data residency preference stated for hosting. The team acknowledges this trade-off for the convenience and feature set of Google Analytics.

---

## 7. Reference

- schema.org Event spec: <https://schema.org/Event>
- Google structured data for events: <https://developers.google.com/search/docs/appearance/structured-data/event>
- Hugo documentation: <https://gohugo.io/documentation/>
- Vercel Hugo deployment: <https://vercel.com/docs/frameworks/hugo>
- Reference implementation: <https://github.com/jstuker/massalia.events>
- Creative Commons BY 4.0: <https://creativecommons.org/licenses/by/4.0/>
