import type { ApiError } from '../types'

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | QueryValue[]>
export type ResponseParser<T> = (value: unknown) => T

export type ApiErrorKind =
  | 'bad-request'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'unavailable'
  | 'http'
  | 'timeout'
  | 'network'
  | 'aborted'
  | 'invalid-response'

export class ApiClientError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly code: string | null
  readonly detail: string | null

  constructor(options: {
    kind: ApiErrorKind
    message: string
    status?: number | null
    code?: string | null
    detail?: string | null
    cause?: unknown
  }) {
    super(options.message, { cause: options.cause })
    this.name = 'ApiClientError'
    this.kind = options.kind
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.detail = options.detail ?? null
  }
}

export interface ApiClientOptions {
  baseUrl?: string
  timeoutMs?: number
  fetchImplementation?: typeof fetch
}

export interface RequestOptions {
  query?: QueryParams
  signal?: AbortSignal
  timeoutMs?: number
}

export interface PostOptions extends RequestOptions {
  headers?: HeadersInit
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'
const DEFAULT_TIMEOUT_MS = 10_000

export function resolveApiBaseUrl(value = import.meta.env.VITE_API_BASE_URL): string {
  const baseUrl = value?.trim() || DEFAULT_API_BASE_URL

  let parsed: URL
  try {
    parsed = new URL(baseUrl)
  } catch (cause) {
    throw new ApiClientError({
      kind: 'invalid-response',
      message: 'VITE_API_BASE_URL no contiene una URL válida.',
      cause,
    })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ApiClientError({
      kind: 'invalid-response',
      message: 'VITE_API_BASE_URL debe usar HTTP o HTTPS.',
    })
  }

  return parsed.toString().replace(/\/$/, '')
}

function appendQuery(url: URL, query?: QueryParams) {
  if (!query) return

  for (const [key, rawValue] of Object.entries(query)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue]
    for (const value of values) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    }
  }
}

function errorKindForStatus(status: number): ApiErrorKind {
  if (status === 400) return 'bad-request'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not-found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation'
  if (status === 503) return 'unavailable'
  return 'http'
}

function messageForStatus(status: number): string {
  if (status === 400) return 'La solicitud contiene datos que la API no puede procesar.'
  if (status === 401) return 'La API requiere una sesión válida.'
  if (status === 403) return 'La sesión no tiene permiso para realizar esta acción.'
  if (status === 404) return 'La información solicitada no existe o aún no está disponible.'
  if (status === 409) return 'La acción entra en conflicto con el estado actual de los datos.'
  if (status === 422) return 'La API rechazó uno o más campos de la solicitud.'
  if (status === 503) return 'La API no está disponible temporalmente. Inténtalo de nuevo más tarde.'
  return `La API respondió con el estado HTTP ${status}.`
}

function readErrorPayload(text: string): Partial<ApiError> {
  if (!text) return {}

  try {
    const value: unknown = JSON.parse(text)
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
    const record = value as Record<string, unknown>
    return {
      detail: typeof record.detail === 'string' ? record.detail : undefined,
      code: typeof record.code === 'string' ? record.code : undefined,
    }
  } catch {
    return {}
  }
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly fetchImplementation: typeof fetch

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = resolveApiBaseUrl(options.baseUrl)
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.fetchImplementation = options.fetchImplementation ?? globalThis.fetch.bind(globalThis)
  }

  get<T>(path: string, parser: ResponseParser<T>, options: RequestOptions = {}): Promise<T> {
    return this.request('GET', path, parser, options)
  }

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    parser: ResponseParser<TResponse>,
    options: PostOptions = {},
  ): Promise<TResponse> {
    return this.request('POST', path, parser, options, body)
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    parser: ResponseParser<T>,
    options: PostOptions,
    body?: unknown,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\//, '')}`)
    appendQuery(url, options.query)

    const controller = new AbortController()
    let timedOut = false
    const timeoutId = globalThis.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, options.timeoutMs ?? this.timeoutMs)
    const abortFromCaller = () => controller.abort()
    options.signal?.addEventListener('abort', abortFromCaller, { once: true })
    if (options.signal?.aborted) controller.abort()

    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (body !== undefined) headers.set('Content-Type', 'application/json')

    try {
      const response = await this.fetchImplementation(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
        credentials: 'omit',
      })
      const text = await response.text()

      if (!response.ok) {
        const payload = readErrorPayload(text)
        throw new ApiClientError({
          kind: errorKindForStatus(response.status),
          status: response.status,
          code: payload.code ?? null,
          detail: payload.detail ?? null,
          message: payload.detail || messageForStatus(response.status),
        })
      }

      let value: unknown
      try {
        value = JSON.parse(text)
      } catch (cause) {
        throw new ApiClientError({
          kind: 'invalid-response',
          status: response.status,
          message: 'La API devolvió una respuesta que no es JSON válido.',
          cause,
        })
      }

      try {
        return parser(value)
      } catch (cause) {
        if (cause instanceof ApiClientError) throw cause
        throw new ApiClientError({
          kind: 'invalid-response',
          status: response.status,
          message: 'La respuesta de la API no coincide con el contrato SilverPulse v0.2.0.',
          cause,
        })
      }
    } catch (cause) {
      if (cause instanceof ApiClientError) throw cause

      if (controller.signal.aborted) {
        throw new ApiClientError({
          kind: timedOut ? 'timeout' : 'aborted',
          message: timedOut
            ? 'La API tardó demasiado en responder.'
            : 'La solicitud fue cancelada antes de completarse.',
          cause,
        })
      }

      throw new ApiClientError({
        kind: 'network',
        message: 'No fue posible conectar con la API. Verifica que FastAPI esté disponible.',
        cause,
      })
    } finally {
      globalThis.clearTimeout(timeoutId)
      options.signal?.removeEventListener('abort', abortFromCaller)
    }
  }
}

export const apiClient = new ApiClient()
