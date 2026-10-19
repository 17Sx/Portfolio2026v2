import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `npm run dev` n'a pas de runtime serverless : on y sert les fonctions de api/ comme Vercel le ferait
function vercelApi(): Plugin {
  return {
    name: 'vercel-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([\w-]+)(?:\?|$)/)
        if (!match) return next()
        try {
          const module = await server.ssrLoadModule(`/api/${match[1]}.ts`)
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
          await module.default(req, response)
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
