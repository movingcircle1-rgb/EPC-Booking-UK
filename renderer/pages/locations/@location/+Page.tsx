import React from 'react'
import LocationPage from '../../../../src/pages/LocationPage'

export default function Page(props: any) {
  const pageContext = props?.pageContext ?? props
  const pageProps = pageContext?.data?.pageProps ?? {}
  return <LocationPage {...pageProps} />
}
