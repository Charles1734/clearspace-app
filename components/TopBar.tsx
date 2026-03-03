'use client'

import { Moon, Sun, Search } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/projects': 'Projects',
  '/notes': 'Notes',
  '/goals': 'Goals',
}

const pageSubs: Record<string, string> = {
  '/': 'Manage and track your life',
  '/tasks': 'Organize your daily tasks',
  '/projects': 'Track your ongoing projects',
  '/notes': 'Your personal notes',
  '/goals': 'Chase your long-term goals',
}

export default function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [search, setSearch] = useState('')

  const titleEntry = Object.entries(pageTitles).find(([key]) =>
    key === '/' ? pathname === '/' : pathname === key || pathname.startsWith(key + '/')
  )
  const pageTitle = titleEntry ? titleEntry[1] : 'Clearspace'
  const pageSub = titleEntry ? pageSubs[titleEntry[0]] : ''

  return (
    <header className="h-16 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-5 px-6 shrink-0">
      {/* Title */}
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-slate-500 leading-none mb-0.5">{pageSub}</p>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{pageTitle}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm ml-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks, notes, projects..."
            className="w-full pl-8 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">C</span>
        </div>
      </div>
    </header>
  )
}
