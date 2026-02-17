/**
 * Decode a Base64-encoded string with full UTF-8 support.
 * Uses TextDecoder for correct and performant handling of multi-byte characters.
 */
export function decodeBase64(encoded: string): string {
  const cleaned = encoded.replace(/\n/g, '')
  try {
    const binaryString = atob(cleaned)
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch (error) {
    throw new Error(
      `Failed to decode Base64 content: ${error instanceof Error ? error.message : 'unknown error'}`,
    )
  }
}
