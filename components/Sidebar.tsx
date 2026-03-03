'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Inbox,
  FolderOpen,
  FileText,
  Target,
  Users,
  Settings,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useState } from 'react'

const mainItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
]

const workspaceItems = [
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/contacts', label: 'Contacts', icon: Users },
]

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[13px] transition-colors group ${
        isActive
          ? 'bg-white/[0.08] text-white font-medium'
          : 'text-[#888] hover:bg-white/[0.04] hover:text-[#ccc]'
      }`}
    >
      <Icon
        size={14}
        strokeWidth={isActive ? 2 : 1.6}
        className={isActive ? 'text-white' : 'text-[#666] group-hover:text-[#aaa]'}
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [workspaceOpen, setWorkspaceOpen] = useState(true)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-[220px] shrink-0 bg-[#111111] flex flex-col h-full border-r border-white/[0.06]">
      {/* Header: Logo + app name + theme toggle */}
      <div className="flex items-center justify-between px-3 py-[14px] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-indigo-600 rounded-[5px] flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">Clearspace</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1 rounded text-[#555] hover:text-[#aaa] transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Main items */}
        <div className="space-y-[1px]">
          {mainItems.map(item => (
            <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
          ))}
        </div>

        {/* Workspace section */}
        <div className="mt-4">
          <button
            onClick={() => setWorkspaceOpen(v => !v)}
            className="flex items-center gap-1 px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#444] hover:text-[#666] transition-colors w-full"
          >
            <ChevronDown
              size={10}
              className={`transition-transform ${workspaceOpen ? '' : '-rotate-90'}`}
            />
            Workspace
          </button>

          {workspaceOpen && (
            <div className="space-y-[1px]">
              {workspaceItems.map(item => (
                <NavItem key={item.href} {...item} isActive={isActive(item.href)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Settings + User */}
      <div className="px-2 pb-3 pt-2 border-t border-white/[0.06] space-y-[1px]">
        <button className="w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[13px] text-[#888] hover:bg-white/[0.04] hover:text-[#ccc] transition-colors">
          <Settings size={14} strokeWidth={1.6} className="text-[#666]" />
          <span>Settings</span>
        </button>
        <div className="flex items-center gap-2 px-2.5 py-[5px]">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
            C
          </div>
          <span className="text-[13px] text-[#666] truncate">Charles</span>
        </div>
      </div>
    </aside>
  )
}
