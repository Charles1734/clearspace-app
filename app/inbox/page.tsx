'use client'

import { Inbox } from 'lucide-react'

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-600 p-6">
      <Inbox size={40} className="mb-4 opacity-20" />
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Inbox coming soon</p>
      <p className="text-xs text-center max-w-xs">
        Notifications, mentions, and updates will appear here once auth is set up.
      </p>
    </div>
  )
}
