import type { Event } from '../types/event'

export interface DuplicateMatch {
  readonly event: Event
  readonly matchedEvent: Event
  readonly score: number
  readonly reasons: readonly string[]
}

export interface DuplicateGroup {
  readonly events: readonly Event[]
  readonly score: number
  readonly reasons: readonly string[]
}

/**
 * Normalize a string for comparison: lowercase, trim, remove extra whitespace,
 * remove common punctuation and diacritics.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Compute bigrams (pairs of consecutive characters) for a string.
 */
function bigrams(text: string): readonly string[] {
  const result: string[] = []
  for (let i = 0; i < text.length - 1; i++) {
    result.push(text.slice(i, i + 2))
  }
  return result
}

/**
 * Dice coefficient: measures similarity between two strings using bigrams.
 * Returns a value between 0 (no similarity) and 1 (identical).
 */
export function diceCoefficient(a: string, b: string): number {
  const normA = normalize(a)
  const normB = normalize(b)

  if (normA === normB) return 1
  if (normA.length < 2 || normB.length < 2) return 0

  const bigramsA = bigrams(normA)
  const bigramsB = bigrams(normB)

  const setB = new Set(bigramsB)
  let matches = 0
  for (const bg of bigramsA) {
    if (setB.has(bg)) {
      matches++
    }
  }

  return (2 * matches) / (bigramsA.length + bigramsB.length)
}

/**
 * Check if two dates are the same day.
 */
function isSameDate(dateA: string, dateB: string): boolean {
  return dateA !== '' && dateB !== '' && dateA === dateB
}

/**
 * Check if two date ranges overlap.
 */
function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  if (!startA || !startB) return false
  const sA = startA
  const eA = endA || startA
  const sB = startB
  const eB = endB || startB
  return sA <= eB && sB <= eA
}

/**
 * Check if locations match (normalized comparison).
 */
function locationsMatch(locA: string, locB: string): boolean {
  if (!locA || !locB) return false
  return normalize(locA) === normalize(locB)
}

const NAME_SIMILARITY_THRESHOLD = 0.6
const HIGH_NAME_SIMILARITY_THRESHOLD = 0.85

/**
 * Compute a duplicate score between two events.
 * Returns a score (0-1) and reasons for the match.
 */
export function computePairScore(
  a: Event,
  b: Event
): { readonly score: number; readonly reasons: readonly string[] } {
  if (a.event_id === b.event_id) {
    return { score: 0, reasons: [] }
  }

  const nameSimilarity = diceCoefficient(a.event_name, b.event_name)
  const reasons: string[] = []
  let score = 0

  // High name similarity alone is a strong signal
  if (nameSimilarity >= HIGH_NAME_SIMILARITY_THRESHOLD) {
    score += 0.5
    reasons.push(`Similar name (${Math.round(nameSimilarity * 100)}%)`)
  } else if (nameSimilarity >= NAME_SIMILARITY_THRESHOLD) {
    score += 0.3
    reasons.push(`Partial name match (${Math.round(nameSimilarity * 100)}%)`)
  }

  // Same start date
  if (isSameDate(a.event_start_date, b.event_start_date)) {
    score += 0.25
    reasons.push('Same start date')
  } else if (datesOverlap(a.event_start_date, a.event_end_date, b.event_start_date, b.event_end_date)) {
    score += 0.15
    reasons.push('Overlapping dates')
  }

  // Same location
  if (locationsMatch(a.location_name, b.location_name)) {
    score += 0.15
    reasons.push('Same location')
  }

  // Same organizer
  if (a.organizer_name && b.organizer_name && normalize(a.organizer_name) === normalize(b.organizer_name)) {
    score += 0.1
    reasons.push('Same organizer')
  }

  // Same URL
  if (a.event_url && b.event_url && a.event_url === b.event_url) {
    score += 0.3
    reasons.push('Same URL')
  }

  return { score: Math.min(score, 1), reasons }
}

const DUPLICATE_THRESHOLD = 0.5

/**
 * Find potential duplicates for a specific event within a list of events.
 */
export function findDuplicatesForEvent(
  event: Event,
  allEvents: readonly Event[],
  threshold: number = DUPLICATE_THRESHOLD
): readonly DuplicateMatch[] {
  const matches: DuplicateMatch[] = []

  for (const other of allEvents) {
    if (other.event_id === event.event_id) continue

    const { score, reasons } = computePairScore(event, other)
    if (score >= threshold) {
      matches.push({ event, matchedEvent: other, score, reasons })
    }
  }

  return [...matches].sort((a, b) => b.score - a.score)
}

/**
 * Find all duplicate groups across a list of events.
 * Groups events that are pairwise duplicates.
 */
export function findAllDuplicateGroups(
  events: readonly Event[],
  threshold: number = DUPLICATE_THRESHOLD
): readonly DuplicateGroup[] {
  // Build adjacency: which events are duplicates of which
  const adjacency = new Map<string, Set<string>>()
  const pairScores = new Map<string, { score: number; reasons: readonly string[] }>()

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i]!
      const b = events[j]!
      const { score, reasons } = computePairScore(a, b)

      if (score >= threshold) {
        const key = `${a.event_id}::${b.event_id}`
        pairScores.set(key, { score, reasons })

        if (!adjacency.has(a.event_id)) adjacency.set(a.event_id, new Set())
        if (!adjacency.has(b.event_id)) adjacency.set(b.event_id, new Set())
        adjacency.get(a.event_id)!.add(b.event_id)
        adjacency.get(b.event_id)!.add(a.event_id)
      }
    }
  }

  // Connected components via BFS
  const visited = new Set<string>()
  const groups: DuplicateGroup[] = []
  const eventMap = new Map(events.map((e) => [e.event_id, e]))

  for (const [eventId] of adjacency) {
    if (visited.has(eventId)) continue

    const component: string[] = []
    const queue = [eventId]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      component.push(current)

      const neighbors = adjacency.get(current)
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }

    if (component.length >= 2) {
      const groupEvents = component
        .map((id) => eventMap.get(id))
        .filter((e): e is Event => e !== undefined)

      // Collect best score and all reasons from pairs in this group
      let bestScore = 0
      const allReasons = new Set<string>()

      for (let i = 0; i < component.length; i++) {
        for (let j = i + 1; j < component.length; j++) {
          const idA = component[i]!
          const idB = component[j]!
          const key = `${idA}::${idB}`
          const reverseKey = `${idB}::${idA}`
          const pair = pairScores.get(key) ?? pairScores.get(reverseKey)
          if (pair) {
            if (pair.score > bestScore) bestScore = pair.score
            for (const reason of pair.reasons) allReasons.add(reason)
          }
        }
      }

      groups.push({
        events: groupEvents,
        score: bestScore,
        reasons: [...allReasons],
      })
    }
  }

  return [...groups].sort((a, b) => b.score - a.score)
}
