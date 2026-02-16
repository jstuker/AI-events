import type { Event } from '../types/event'
import type { GitHubTreeResponse, GitHubBlobResponse } from '../types/github'

export function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    event_id: 'evt-001',
    date: '2026-03-15',
    slug: 'test-ai-event',
    status: 'published',
    source: 'manual',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    contact_name: 'Test Contact',
    contact_email: 'test@example.com',
    contact_phone: '+41 79 000 00 00',
    event_name: 'Test AI Event',
    event_description: 'A test event for AI enthusiasts',
    event_url: 'https://example.com/event',
    event_start_date: '2026-03-15',
    event_end_date: '2026-03-16',
    event_price_type: 'free',
    event_price: null,
    event_price_currency: 'CHF',
    event_low_price: null,
    event_high_price: null,
    event_price_availability: 'InStock',
    event_image_1x1: '',
    event_image_16x9: '',
    event_language: ['en'],
    event_attendance_mode: 'presence',
    event_target_audience: 'developers',
    location_name: 'Zurich',
    location_address: 'Bahnhofstrasse 1',
    organizer_name: 'Test Org',
    organizer_url: 'https://example.com',
    featured: false,
    featured_type: '',
    tags: ['ai', 'tech'],
    publication_channels: [],
    locations: [],
    cities: [],
    organizers: [],
    body: 'Event body content',
    filePath: 'content/events/2026/03/15/evt-001.md',
    ...overrides,
  }
}

export function createEvents(): readonly Event[] {
  return [
    createEvent({
      event_id: 'evt-001',
      event_name: 'Zurich AI Hackathon',
      event_start_date: '2026-03-15',
      location_name: 'Zurich',
      organizer_name: 'SwissAI',
      status: 'published',
      source: 'manual',
      featured: true,
      featured_type: 'badge',
      updated_at: '2026-01-15T00:00:00Z',
    }),
    createEvent({
      event_id: 'evt-002',
      event_name: 'Geneva ML Workshop',
      event_start_date: '2026-04-10',
      location_name: 'Geneva',
      organizer_name: 'MLGeneva',
      status: 'draft',
      source: 'api',
      featured: false,
      updated_at: '2026-02-01T00:00:00Z',
    }),
    createEvent({
      event_id: 'evt-003',
      event_name: 'Bern Data Summit',
      event_start_date: '2026-05-20',
      location_name: 'Bern',
      organizer_name: 'DataBern',
      status: 'review',
      source: 'manual',
      featured: false,
      updated_at: '2026-01-20T00:00:00Z',
    }),
  ]
}

export const SAMPLE_FRONTMATTER = `---
event_id: evt-001
event_name: Zurich AI Hackathon
status: published
event_start_date: "2026-03-15"
location_name: Zurich
organizer_name: SwissAI
featured: true
tags:
  - ai
  - hackathon
---
This is the event body.`

export const MINIMAL_FRONTMATTER = `---
event_name: Minimal Event
---
`

export const NO_FRONTMATTER = 'Just plain text with no frontmatter.'

export const EMPTY_FRONTMATTER = `---
---
`

export function createTreeResponse(paths: readonly string[] = []): GitHubTreeResponse {
  return {
    sha: 'abc123',
    url: 'https://api.github.com/repos/test/repo/git/trees/abc123',
    tree: paths.map((path) => ({
      path,
      mode: '100644',
      type: 'blob',
      sha: `sha-${path}`,
      url: `https://api.github.com/repos/test/repo/git/blobs/sha-${path}`,
    })),
    truncated: false,
  }
}

export function createBlobResponse(content: string): GitHubBlobResponse {
  return {
    sha: 'blob-sha',
    node_id: 'node-id',
    size: content.length,
    url: 'https://api.github.com/repos/test/repo/git/blobs/blob-sha',
    content: btoa(content),
    encoding: 'base64',
  }
}
