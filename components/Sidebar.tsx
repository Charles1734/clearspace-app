'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, FolderOpen, FileText, Target, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/goals', label: 'Goals', icon: Target },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-16 shrink-0 bg-slate-900 flex flex-col items-center py-5">
      {/* Logo */}
      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shrink-0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
        </svg>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-slate-700">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 w-full">
        <button
          title="Settings"
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-600 hover:bg-slate-800 hover:text-slate-300 transition-all"
        >
          <Settings size={19} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  )
}
