'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type MenuItem = {
  id: number
  name: string
  price: number
  description?: string | null
  category_id: number
}

export type MenuCategory = {
  id: number
  name: string
}

export type GroupedMenu = {
  category: MenuCategory
  items: MenuItem[]
}

export function useMenuItems() {
  const [grouped, setGrouped] = useState<GroupedMenu[]>([])
  const [loading, setLoading] = useState(true)
  const restaurant = process.env.NEXT_PUBLIC_RESTAURANT!

  useEffect(() => {
    Promise.all([
      supabase
        .from('menu_items')
        .select('id, name, price, description, category_id')
        .eq('restaurant', restaurant)
        .eq('available', true)
        .order('name', { ascending: true }),
      supabase
        .from('menu_categories')
        .select('id, name')
        .eq('restaurant', restaurant)
        .order('name', { ascending: true }),
    ]).then(([{ data: items }, { data: categories }]) => {
      if (!items || !categories) return
      const result: GroupedMenu[] = categories
        .map((cat) => ({
          category: cat as MenuCategory,
          items: (items as MenuItem[]).filter((i) => i.category_id === cat.id),
        }))
        .filter((g) => g.items.length > 0)
      setGrouped(result)
      setLoading(false)
    })
  }, [restaurant])

  return { grouped, loading }
}
