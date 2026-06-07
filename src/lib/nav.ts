export function hardNavigate(url: string) {
  if (typeof window === 'undefined') return
  window.location.assign(url)
}
