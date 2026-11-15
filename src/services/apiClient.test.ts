import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from './apiClient'

describe('ApiClient', () => {
  it('invoca el fetch global conservando su contexto en navegador', async () => {
    const fetchImplementation = vi.fn(function (this: unknown) {
      expect(this).toBe(globalThis)
      return Promise.resolve(new Response('{"status":"ok"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    })
    vi.stubGlobal('fetch', fetchImplementation)

    try {
      const client = new ApiClient({ baseUrl: 'http://localhost:8000/api/v1' })
      const result = await client.get('/health', (value) => value)

      expect(result).toEqual({ status: 'ok' })
      expect(fetchImplementation).toHaveBeenCalledOnce()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
