import type { Config } from 'vike/types'

export default {
  clientRouting: false,
  passToClient: ['pageProps', 'routeParams'],
  prerender: true
} satisfies Config
