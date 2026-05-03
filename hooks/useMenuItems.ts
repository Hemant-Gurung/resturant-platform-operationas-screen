'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { VatRate } from '@/lib/vat'

export type MenuItem = {
  id: number
  name: string
  price: number
  description?: string | null
  category_id: number
  vat_rate: VatRate
}

export type MenuCategory = {
  id: number
  name: string
}

export type GroupedMenu = {
  category: MenuCategory
  items: MenuItem[]
}

export function useMenuItems(locale?: string) {
  const [grouped, setGrouped] = useState<GroupedMenu[]>([])
  const [loading, setLoading] = useState(true)
  const restaurant = process.env.NEXT_PUBLIC_RESTAURANT!
  const resolvedLocale = locale ?? process.env.NEXT_PUBLIC_LOCALE ?? 'en'

  useEffect(() => {
    Promise.all([
      supabase
        .from('menu_items')
        .select('id, price, category_id, vat_rate')
        .eq('restaurant', restaurant)
        .eq('available', true),
      supabase
        .from('menu_items_locales')
        .select('_parent_id, name, description')
        .eq('_locale', resolvedLocale),
      supabase
        .from('menu_categories')
        .select('id')
        .eq('restaurant', restaurant),
      supabase
        .from('menu_categories_locales')
        .select('_parent_id, name')
        .eq('_locale', resolvedLocale),
    ]).then(([{ data: rawItems }, { data: itemLocales }, { data: rawCats }, { data: catLocales }]) => {
      if (rawItems && itemLocales && rawCats && catLocales) {
        const items: MenuItem[] = rawItems.map((item) => {
          const loc = itemLocales.find((l) => l._parent_id === item.id)
          return {
            id: item.id,
            price: item.price,
            category_id: item.category_id,
            vat_rate: (item.vat_rate ?? 12) as VatRate,
            name: loc?.name ?? '',
            description: loc?.description ?? null,
          }
        })

        const categories: MenuCategory[] = rawCats.map((cat) => {
          const loc = catLocales.find((l) => l._parent_id === cat.id)
          return { id: cat.id, name: loc?.name ?? '' }
        })

        const result: GroupedMenu[] = categories
          .map((cat) => ({
            category: cat,
            items: items.filter((i) => i.category_id === cat.id),
          }))
          .filter((g) => g.items.length > 0)

        setGrouped(result)
      }
      setLoading(false)
    })
  }, [restaurant, resolvedLocale])

  return { grouped, loading }
}
