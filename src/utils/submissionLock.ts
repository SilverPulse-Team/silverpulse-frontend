export interface SubmissionRunResult<T> {
  started: boolean
  value?: T
}

export function createSubmissionLock() {
  let active = false

  return {
    get active() {
      return active
    },

    async run<T>(action: () => Promise<T>): Promise<SubmissionRunResult<T>> {
      if (active) return { started: false }
      active = true
      try {
        return { started: true, value: await action() }
      } finally {
        active = false
      }
    },
  }
}
