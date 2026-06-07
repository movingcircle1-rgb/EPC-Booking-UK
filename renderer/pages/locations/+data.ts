import type { DataAsync } from 'vike/types'

export const data: DataAsync = async () => {
  return {
    pageProps: {
      locationSlugs: ['stafford', 'walsall', 'lichfield'],
    },
  }
}
