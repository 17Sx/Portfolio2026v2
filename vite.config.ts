import type { IncomingMessage } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

// `npm run dev` n'a pas de runtime serverless : on y sert les fonctions de api/ comme Vercel le ferait,
// avec req.query, req.body (JSON parsé, sinon texte brut) et les variables de .env.local
function vercelApi(): Plugin {
  return {
    name: 'vercel-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''))

      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([\w-]+)(?:\?|$)/)
        if (!match) return next()
        try {
          const module = await server.ssrLoadModule(`/api/${match[1]}.ts`)
          const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await readBody(req)
          let body: unknown = raw || undefined
          if (raw && req.headers['content-type']?.includes('application/json')) {
            try {
              body = JSON.parse(raw)
            } catch {
              // Vercel laisse aussi le texte brut quand le JSON est invalide
            }
          }
          const query = Object.fromEntries(new URL(req.url ?? '/', 'http://localhost').searchParams)
          const request = Object.assign(req, { query, body })
          const response = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return response
            },
            json(body: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(body))
              return response
            },
            redirect(code: number, location: string) {
              res.statusCode = code
              res.setHeader('Location', location)
              res.end()
              return response
            },
          })
          await module.default(request, response)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApi()],
})
