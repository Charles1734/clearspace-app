'use client'

import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Overview of your work' },
  '/tasks': { title: 'My Tasks', sub: 'Everything on your plate' },
  '/inbox': { title: 'Inbox', sub: 'Notifications and updates' },
  '/projects': { title: 'Projects', sub: 'Track your ongoing work' },
  '/notes': { title: 'Notes', sub: 'Your personal knowledge base' },
  '/goals': { title: 'Goals', sub: 'Long-term targets' },
  '/contacts': { title: 'Contacts', sub: 'People you work with' },
}

export default function TopBar() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')

  const matched = Object.entries(pageTitles).find(([key]) =>
    key === '/' ? pathname === '/' : pathname === key || pathname.startsWith(key + '/')
  )
  const page = matched ? matched[1] : { title: 'Clearspace', sub: '' }

  return (
    <header className="h-12 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-4 px-5 shrink-0">
      {/* Title */}
      <h1 className="text-[13px] font-semibold text-gray-900 dark:text-white whitespace-nowrap">
        {page.title}
      </h1>
      <span className="text-[12px] text-gray-400 dark:text-slate-500 hidden sm:block">{page.sub}</span>

      {/* Search */}
      <div className="ml-auto w-56">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </header>
  )
}
