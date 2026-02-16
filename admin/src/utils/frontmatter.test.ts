import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from './frontmatter'
import { SAMPLE_FRONTMATTER, NO_FRONTMATTER, EMPTY_FRONTMATTER } from '../test/fixtures'

describe('parseFrontmatter', () => {
  it('parses valid frontmatter and body', () => {
    const result = parseFrontmatter(SAMPLE_FRONTMATTER)
    expect(result.data['event_name']).toBe('Zurich AI Hackathon')
    expect(result.data['status']).toBe('published')
    expect(result.data['featured']).toBe(true)
    expect(result.data['tags']).toEqual(['ai', 'hackathon'])
    expect(result.body).toBe('This is the event body.')
  })

  it('returns empty data when no frontmatter delimiters', () => {
    const result = parseFrontmatter(NO_FRONTMATTER)
    expect(result.data).toEqual({})
    expect(result.body).toBe(NO_FRONTMATTER)
  })

  it('handles empty frontmatter block (no regex match)', () => {
    const result = parseFrontmatter(EMPTY_FRONTMATTER)
    // Empty frontmatter has no content between delimiters, so regex doesn't match
    expect(result.data).toEqual({})
    expect(result.body).toBe(EMPTY_FRONTMATTER)
  })

  it('handles empty string input', () => {
    const result = parseFrontmatter('')
    expect(result.data).toEqual({})
    expect(result.body).toBe('')
  })

  it('handles frontmatter with Windows line endings', () => {
    const raw = '---\r\ntitle: Test\r\n---\r\nBody text'
    const result = parseFrontmatter(raw)
    expect(result.data['title']).toBe('Test')
    expect(result.body).toBe('Body text')
  })

  it('handles numeric values in frontmatter', () => {
    const raw = '---\nprice: 42\nrating: 3.5\n---\n'
    const result = parseFrontmatter(raw)
    expect(result.data['price']).toBe(42)
    expect(result.data['rating']).toBe(3.5)
  })

  it('handles frontmatter with no body', () => {
    const raw = '---\nkey: value\n---\n'
    const result = parseFrontmatter(raw)
    expect(result.data['key']).toBe('value')
    expect(result.body).toBe('')
  })
})
