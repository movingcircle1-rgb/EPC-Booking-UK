import LocationsIndexPage from '../../../src/pages/LocationsIndexPage'

type PageProps = {
  pageProps?: {
    locationSlugs?: string[]
  }
}

export default function Page({ pageProps }: PageProps) {
  return <LocationsIndexPage locationSlugs={pageProps?.locationSlugs ?? []} />
}
