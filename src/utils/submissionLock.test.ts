import { describe, expect, it, vi } from 'vitest'
import { createSubmissionLock } from './submissionLock'

describe('createSubmissionLock', () => {
  it('impide una segunda ejecución mientras la primera sigue pendiente', async () => {
    let release: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    const action = vi.fn(async () => {
      await pending
      return 'ok'
    })
    const lock = createSubmissionLock()

    const first = lock.run(action)
    const second = await lock.run(action)

    expect(second).toEqual({ started: false })
    expect(action).toHaveBeenCalledTimes(1)
    release?.()
    await expect(first).resolves.toEqual({ started: true, value: 'ok' })
  })

  it('libera el bloqueo incluso cuando la operación falla', async () => {
    const lock = createSubmissionLock()
    await expect(lock.run(async () => { throw new Error('fallo') })).rejects.toThrow('fallo')
    await expect(lock.run(async () => 'recuperado')).resolves.toEqual({ started: true, value: 'recuperado' })
  })
})
