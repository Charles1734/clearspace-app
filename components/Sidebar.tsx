'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, FolderOpen, FileText, Target } from 'lucide-react'

const navItems = [
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/goals', label: 'Goals', icon: Target },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
            Clearspace
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-100'
              }`}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.5 : 1.75}
                className="shrink-0"
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800">
        <p className="text-xs text-gray-300 dark:text-slate-700">Clearspace v0.1</p>
      </div>
    </aside>
  )
}
