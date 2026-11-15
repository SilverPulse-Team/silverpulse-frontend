import { describe, expect, it } from 'vitest'
import { toSafeExternalUrl } from './sourceUrl'

describe('enlaces de fuentes externas', () => {
  it('conserva URLs HTTP(S) del catálogo', () => {
    expect(toSafeExternalUrl('https://example.org/source')).toBe('https://example.org/source')
    expect(toSafeExternalUrl('http://example.org/source')).toBe('http://example.org/source')
  })

  it('omite enlaces con esquemas no web o formato inválido', () => {
    expect(toSafeExternalUrl('javascript:alert(1)')).toBeUndefined()
    expect(toSafeExternalUrl('not a url')).toBeUndefined()
  })
})
