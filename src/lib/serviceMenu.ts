export type ServiceRow = {
  name: string
  slug: string
  parent_slug: string | null
  sort_order: number | null
  menu_label: string | null
  marketing_path: string | null
}

export type ServiceMenuItem = {
  name: string
  slug: string
  parent_slug: string | null
  sort_order: number | null
  menu_label: string | null
  marketing_path: string | null
  children: ServiceMenuItem[]
}

export function buildServiceTree(rows: ServiceRow[]): ServiceMenuItem[] {
  const bySlug = new Map<string, ServiceMenuItem>()
  const roots: ServiceMenuItem[] = []

  for (const row of rows) {
    bySlug.set(row.slug, {
      ...row,
      children: []
    })
  }

  for (const item of bySlug.values()) {
    if (item.parent_slug && bySlug.has(item.parent_slug)) {
      bySlug.get(item.parent_slug)!.children.push(item)
    } else {
      roots.push(item)
    }
  }

  const sortItems = (items: ServiceMenuItem[]) => {
    items.sort((a, b) => {
      const sortA = a.sort_order ?? 999999
      const sortB = b.sort_order ?? 999999

      if (sortA !== sortB) return sortA - sortB
      return a.name.localeCompare(b.name)
    })

    items.forEach((item) => sortItems(item.children))
  }

  sortItems(roots)

  return roots
}
