import { describe, it, expect } from 'vitest'
import { canTransition, getNextStatuses, isTerminalStatus } from './status-workflow'
import type { EventStatus } from '../types/event'

describe('canTransition', () => {
  const validTransitions: [EventStatus, EventStatus][] = [
    ['draft', 'review'],
    ['draft', 'archived'],
    ['review', 'draft'],
    ['review', 'pending'],
    ['review', 'archived'],
    ['pending', 'review'],
    ['pending', 'approved'],
    ['pending', 'archived'],
    ['approved', 'published'],
    ['approved', 'review'],
    ['approved', 'archived'],
    ['published', 'archived'],
  ]

  it.each(validTransitions)('allows %s → %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true)
  })

  const invalidTransitions: [EventStatus, EventStatus][] = [
    ['draft', 'pending'],
    ['draft', 'approved'],
    ['draft', 'published'],
    ['review', 'approved'],
    ['review', 'published'],
    ['pending', 'draft'],
    ['pending', 'published'],
    ['approved', 'draft'],
    ['approved', 'pending'],
    ['published', 'draft'],
    ['published', 'review'],
    ['published', 'pending'],
    ['published', 'approved'],
    ['archived', 'draft'],
    ['archived', 'review'],
    ['archived', 'pending'],
    ['archived', 'approved'],
    ['archived', 'published'],
  ]

  it.each(invalidTransitions)('rejects %s → %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false)
  })
})

describe('getNextStatuses', () => {
  it('returns review and archived for draft', () => {
    expect(getNextStatuses('draft')).toEqual(['review', 'archived'])
  })

  it('returns draft, pending, archived for review', () => {
    expect(getNextStatuses('review')).toEqual(['draft', 'pending', 'archived'])
  })

  it('returns review, approved, archived for pending', () => {
    expect(getNextStatuses('pending')).toEqual(['review', 'approved', 'archived'])
  })

  it('returns published, review, archived for approved', () => {
    expect(getNextStatuses('approved')).toEqual(['published', 'review', 'archived'])
  })

  it('returns archived for published', () => {
    expect(getNextStatuses('published')).toEqual(['archived'])
  })

  it('returns empty array for archived', () => {
    expect(getNextStatuses('archived')).toEqual([])
  })
})

describe('isTerminalStatus', () => {
  it('returns true for archived', () => {
    expect(isTerminalStatus('archived')).toBe(true)
  })

  const nonTerminal: EventStatus[] = ['draft', 'review', 'pending', 'approved', 'published']

  it.each(nonTerminal)('returns false for %s', (status) => {
    expect(isTerminalStatus(status)).toBe(false)
  })
})
