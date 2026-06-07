import React from 'react'
import ArticleDetailPage from '../../../../src/pages/ArticleDetailPage'

export { Page }

function Page(pageContext: any) {

  let slug = ''

  if (pageContext?.urlPathname) {
    const parts = pageContext.urlPathname.split('/').filter(Boolean)
    slug = parts[1] || ''
  }

  return <ArticleDetailPage slug={slug} />
}
