import React from 'react'

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
}

/**
 * SSR-safe link component.
 * Uses a normal <a> so it never depends on react-router context/hooks.
 */
export default function SafeLink({ to, children, ...rest }: Props) {
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  )
}
