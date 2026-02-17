import { describe, it, expect } from 'vitest'
import { decodeBase64 } from './encoding'

describe('decodeBase64', () => {
  it('decodes ASCII content', () => {
    const encoded = btoa('Hello, World!')
    expect(decodeBase64(encoded)).toBe('Hello, World!')
  })

  it('decodes UTF-8 content with German umlauts', () => {
    // Encode UTF-8 string to base64
    const text = 'Zürich Ärzte Übung'
    const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    expect(decodeBase64(encoded)).toBe(text)
  })

  it('decodes UTF-8 content with French accents', () => {
    const text = 'Conférence à Genève'
    const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(text)))
    expect(decodeBase64(encoded)).toBe(text)
  })

  it('handles empty string', () => {
    const encoded = btoa('')
    expect(decodeBase64(encoded)).toBe('')
  })

  it('handles base64 with newlines (GitHub format)', () => {
    const text = 'Hello, World!'
    const encoded = btoa(text).match(/.{1,4}/g)!.join('\n')
    expect(decodeBase64(encoded)).toBe(text)
  })

  it('throws descriptive error for malformed base64', () => {
    expect(() => decodeBase64('not-valid-base64!!!')).toThrow(
      'Failed to decode Base64 content',
    )
  })
})
