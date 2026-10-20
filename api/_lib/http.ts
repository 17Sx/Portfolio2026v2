import type { IncomingHttpHeaders } from 'node:http'

// The subset of VercelRequest / VercelResponse the handlers rely on, so the
// Vite dev middleware can serve them without the Vercel runtime.
export type ApiRequest = {
  method?: string
  headers: IncomingHttpHeaders
  body?: unknown
  query: Record<string, string | string[] | undefined>
}

export type ApiResponse = {
  status(code: number): ApiResponse
  setHeader(name: string, value: string): unknown
  json(body: unknown): unknown
  end(): unknown
}

export function header(req: ApiRequest, name: string): string {
  const value = req.headers[name]
  return (Array.isArray(value) ? value[0] : value) ?? ''
}
