# Event YAML Frontmatter Schema

Defines the complete YAML frontmatter schema for event content files stored at `content/events/{year}/{month}/{day}/{uuid}.md`.

Reference: [schema.org Event specification](https://schema.org/Event)

---

## Field Reference

### Organizer-Submitted Fields

#### Contact Information

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `contact_name` | **M** | Text | Contact person name |
| `contact_email` | **M** | Email | Contact person email |
| `contact_phone` | O | Phone | Contact person phone (E.164 format recommended) |

#### Event Details

| Field | Required | Type | schema.org | Description |
|-------|----------|------|------------|-------------|
| `event_name` | **M** | Text | `name` | Event title |
| `event_description` | **M** | Text | `description` | Event description (also used in meta tags) |
| `event_url` | **M** | URL | `offers.url` | Ticketing / registration URL |
| `event_start_date` | **M** | ISO-8601 | `startDate` | Start date+time in Zurich timezone (`+01:00` CET / `+02:00` CEST) |
| `event_end_date` | **M** | ISO-8601 | `endDate` | End date+time in Zurich timezone |
| `event_price_type` | O | Enum | — | `free`, `paid`, `range` (default: `free`) |
| `event_price` | O | Number | `offers.price` | Fixed ticket price (required when `price_type` = `paid`) |
| `event_price_currency` | O | Text | `offers.priceCurrency` | ISO 4217 code, e.g. `CHF`, `EUR` (required when any price is set) |
| `event_low_price` | O | Number | `offers.lowPrice` | Lowest price (required when `price_type` = `range`) |
| `event_high_price` | O | Number | `offers.highPrice` | Highest price (required when `price_type` = `range`) |
| `event_price_availability` | O | Enum | `offers.availability` | `InStock`, `SoldOut`, `PreOrder` (default: `InStock`) |
| `event_image_1x1` | O | URL/path | `image` | Square image (min 720px, recommended 1920px) |
| `event_image_16x9` | O | URL/path | `image` | Widescreen image (min 720px, recommended 1920px) |
| `event_language` | O | List | — | Language codes: `de`, `fr`, `it`, `en` (default: `["en"]`) |
| `event_attendance_mode` | O | Enum | `eventAttendanceMode` | `presence`, `online`, `hybrid` (default: `presence`) |
| `event_target_audience` | O | Text | — | Target audience description |

#### Location

| Field | Required | Type | schema.org | Description |
|-------|----------|------|------------|-------------|
| `location_name` | **M** | Text | `location.name` | Venue name. **Also used as Hugo `locations` taxonomy term.** |
| `location_address` | **M** | Text | `location.address` | Full street address |

#### Organizer

| Field | Required | Type | schema.org | Description |
|-------|----------|------|------------|-------------|
| `organizer_name` | O | Text | `organizer.name` | Organizer name. **Also used as Hugo `organizers` taxonomy term.** |
| `organizer_url` | O | URL | `organizer.url` | Organizer website |

### Internal Metadata (System-Managed)

These fields are managed by the system/editorial team, not submitted by organizers.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `event_id` | Auto | UUID | Unique identifier (auto-generated) |
| `date` | Auto | ISO-8601 | **Must match `event_start_date`.** Used by Hugo for permalink date tokens and future-content gating. |
| `slug` | **M** | Text | ASCII-only, lowercase, hyphenated version of `event_name`. Used in permalink URL. No diacritics, unicode, or `%`. |
| `status` | Auto | Enum | `draft`, `review`, `pending`, `approved`, `published`, `archived` (default: `draft`) |
| `source` | Auto | Text | Submission source: `form`, `api`, `manual`, or partner name |
| `created_at` | Auto | ISO-8601 | Submission timestamp |
| `updated_at` | Auto | ISO-8601 | Last modification timestamp |
| `featured` | O | Boolean | Highlight for paying partners (default: `false`) |
| `featured_type` | O | Enum | `badge`, `accent_border`, `larger_card`, `position_boost` |
| `tags` | O | List | Grouping/category tags. **Also used as Hugo `tags` taxonomy.** |
| `publication_channels` | O | List | Target channels: `saiw`, `kickstart`, etc. (default: `["saiw"]`) |

---

## Validation Rules

### Mandatory Fields

All events must have: `contact_name`, `contact_email`, `event_name`, `event_description`, `event_url`, `event_start_date`, `event_end_date`, `location_name`, `location_address`.

System must auto-generate: `event_id`, `date`, `slug`, `status`, `source`, `created_at`, `updated_at`.

### Price Type Conditional Logic

| `event_price_type` | Required fields | Notes |
|---------------------|-----------------|-------|
| `free` (default) | None | Price fields ignored |
| `paid` | `event_price`, `event_price_currency` | Single fixed price |
| `range` | `event_low_price`, `event_high_price`, `event_price_currency` | Price range |

### Date Format

All dates use ISO-8601 with explicit Zurich timezone offset:
- CET (winter): `2026-02-16T10:00:00+01:00`
- CEST (summer): `2026-09-17T09:00:00+02:00`

### Status Lifecycle

```
draft → review → pending → approved → published → archived
```

- `draft`: Default for all new submissions, not visible on public site
- `review`: Flagged for team review (duplicate detection, quality check)
- `pending`: More information requested from submitter
- `approved`: Reviewed and approved, ready for publication
- `published`: Live on website and available via data exports
- `archived`: Past events or manually removed

### Taxonomy Double-Duty Fields

Three frontmatter fields serve as both event data and Hugo taxonomy terms:

| Event field | Hugo taxonomy | Notes |
|-------------|---------------|-------|
| `tags` | `tags` | Direct — the list value is used as-is |
| `location_name` | `locations` | Hugo config maps `location_name` to the `locations` taxonomy |
| `organizer_name` | `organizers` | Hugo config maps `organizer_name` to the `organizers` taxonomy |

This eliminates the need for separate taxonomy arrays in frontmatter.

---

## schema.org Mapping

The following fields map directly to [schema.org Event](https://schema.org/Event) properties and are rendered as JSON-LD in the single event page template:

```
event_name           → schema:name
event_description    → schema:description
event_start_date     → schema:startDate
event_end_date       → schema:endDate
event_url            → schema:offers.url
event_price          → schema:offers.price
event_price_currency → schema:offers.priceCurrency
event_low_price      → schema:offers.lowPrice
event_high_price     → schema:offers.highPrice
event_price_availability → schema:offers.availability
event_image_1x1      → schema:image (Square, 1:1)
event_image_16x9     → schema:image (Wide, 16:9)
event_attendance_mode → schema:eventAttendanceMode
location_name        → schema:location.name
location_address     → schema:location.address.streetAddress
organizer_name       → schema:organizer.name
organizer_url        → schema:organizer.url
```

### Attendance Mode Mapping

| Frontmatter value | schema.org value |
|-------------------|-----------------|
| `presence` | `https://schema.org/OfflineEventAttendanceMode` |
| `online` | `https://schema.org/OnlineEventAttendanceMode` |
| `hybrid` | `https://schema.org/MixedEventAttendanceMode` |
