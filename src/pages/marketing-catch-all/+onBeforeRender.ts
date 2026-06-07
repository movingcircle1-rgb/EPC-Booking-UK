import { getMarketingPageDataByPath } from '../../lib/marketingPages.server'

export async function onBeforeRender(pageContext: { urlPathname: string }) {
  console.log('[marketing] pathname:', pageContext.urlPathname)

  const page = await getMarketingPageDataByPath(pageContext.urlPathname)

  console.log('[marketing] result:', JSON.stringify(page, null, 2))

  if (!page || !page.content) {
    const err = new Error('Marketing page not found')
    ;(err as Error & { statusCode?: number }).statusCode = 404
    throw err
  }

  return {
    pageContext: {
      pageProps: {
        service: page.service,
        content: page.content,
        blocks: page.blocks,
        faqs: page.faqs,
      },
      documentProps: {
        title: page.content.meta_title || page.content.h1,
        description: page.content.meta_description || '',
      },
    },
  }
}
