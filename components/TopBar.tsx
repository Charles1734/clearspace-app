'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/tasks': 'Tasks',
  '/projects': 'Projects',
  '/notes': 'Notes',
  '/goals': 'Goals',
}

export default function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const entry = Object.entries(pageTitles).find(
    ([key]) => pathname === key || pathname.startsWith(key + '/')
  )
  const pageTitle = entry ? entry[1] : 'Clearspace'

  return (
    <header className="h-13 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 py-3.5">
      <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  )
}
