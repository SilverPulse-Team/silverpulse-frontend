export function toSafeExternalUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.href
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error
  }

  return undefined
}
