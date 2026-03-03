'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task, Project, Note, Goal } from '@/types'
import { CheckCircle2, Circle, FolderOpen, FileText, Target, ArrowUpRight, Plus } from 'lucide-react'
import Link from 'next/link'

const priorityBorderBg = {
  high: { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
  low: { border: 'border-l-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
}

const goalBarColors = ['bg-indigo-500', 'bg-orange-500', 'bg-teal-500', 'bg-violet-500', 'bg-rose-500']
const noteAccents = [
  { bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500' },
  { bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  { bg: 'bg-teal-50 dark:bg-teal-950/40', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500' },
]

function DonutChart({ active, paused, done, total }: { active: number; paused: number; done: number; total: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const activeArc = total > 0 ? (active / total) * circ : 0
  const pausedArc = total > 0 ? (paused / total) * circ : 0
  const doneArc = total > 0 ? (done / total) * circ : 0
  return (
    <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="16" stroke="#f1f5f9" className="dark:stroke-slate-800" />
      {total > 0 && (
        <>
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="16" stroke="#10b981" strokeDasharray={`${activeArc} ${circ}`} strokeDashoffset="0" />
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="16" stroke="#f59e0b" strokeDasharray={`${pausedArc} ${circ}`} strokeDashoffset={`-${activeArc}`} />
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="16" stroke="#6366f1" strokeDasharray={`${doneArc} ${circ}`} strokeDashoffset={`-${activeArc + pausedArc}`} />
        </>
      )}
    </svg>
  )
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('notes').select('*').order('updated_at', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
    ]).then(([t, p, n, g]) => {
      if (t.data) setTasks(t.data)
      if (p.data) setProjects(p.data)
      if (n.data) setNotes(n.data)
      if (g.data) setGoals(g.data)
      setLoading(false)
    })
  }, [])

  const activeProjects = projects.filter(p => p.status === 'active').length
  const pausedProjects = projects.filter(p => p.status === 'paused').length
  const doneProjects = projects.filter(p => p.status === 'done').length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = tasks.filter(t => !t.completed).length

  const stats = [
    { label: 'Total Tasks', value: tasks.length, sub: `${pendingTasks} pending`, icon: CheckCircle2, iconBg: 'bg-indigo-100 dark:bg-indigo-950', iconColor: 'text-indigo-600 dark:text-indigo-400', href: '/tasks' },
    { label: 'Active Projects', value: activeProjects, sub: `${projects.length} total`, icon: FolderOpen, iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: 'text-orange-600 dark:text-orange-400', href: '/projects' },
    { label: 'Notes', value: notes.length, sub: 'saved notes', icon: FileText, iconBg: 'bg-teal-100 dark:bg-teal-950', iconColor: 'text-teal-600 dark:text-teal-400', href: '/notes' },
    { label: 'Goals', value: goals.length, sub: `${goals.filter(g => g.progress >= 100).length} achieved`, icon: Target, iconBg: 'bg-violet-100 dark:bg-violet-950', iconColor: 'text-violet-600 dark:text-violet-400', href: '/goals' },
  ]

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, iconBg, iconColor, href }) => (
          <Link key={label} href={href} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon size={19} className={iconColor} />
              </div>
              <ArrowUpRight size={14} className="text-gray-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '–' : value}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{loading ? '...' : sub}</p>
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">My Tasks</h3>
            <Link href="/tasks" className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
              <Plus size={14} />
            </Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{completedTasks} of {tasks.length} completed</p>
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
            ) : tasks.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-600 text-center py-8">No tasks yet</p>
            ) : (
              tasks.slice(0, 6).map(task => (
                <div key={task.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-l-4 ${priorityBorderBg[task.priority].border} ${priorityBorderBg[task.priority].bg}`}>
                  {task.completed ? <CheckCircle2 size={15} className="text-indigo-500 shrink-0" /> : <Circle size={15} className="text-gray-300 dark:text-slate-600 shrink-0" />}
                  <span className={`flex-1 text-xs font-medium truncate ${task.completed ? 'line-through text-gray-400 dark:text-slate-600' : 'text-gray-800 dark:text-slate-200'}`}>{task.title}</span>
                  <span className={`text-xs font-bold shrink-0 ${priorityBorderBg[task.priority].text}`}>{task.priority.charAt(0).toUpperCase()}</span>
                </div>
              ))
            )}
          </div>
          {tasks.length > 6 && (
            <Link href="/tasks" className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              See all {tasks.length} tasks <ArrowUpRight size={11} />
            </Link>
          )}
        </div>

        {/* Projects donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Projects Overview</h3>
            <Link href="/projects" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline">View all <ArrowUpRight size={11} /></Link>
          </div>
          <div className="flex items-center justify-center mb-4 relative">
            <DonutChart active={activeProjects} paused={pausedProjects} done={doneProjects} total={projects.length} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500">projects</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'In Progress', count: activeProjects, color: 'bg-emerald-500' },
              { label: 'Paused', count: pausedProjects, color: 'bg-amber-500' },
              { label: 'Completed', count: doneProjects, color: 'bg-indigo-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-gray-600 dark:text-slate-300">{label}</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Goal Progress</h3>
            <Link href="/goals" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline">View all <ArrowUpRight size={11} /></Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
            ) : goals.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-600 text-center py-8">No goals set yet</p>
            ) : (
              goals.slice(0, 5).map((goal, i) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate flex-1 pr-3">{goal.title}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white shrink-0">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${goalBarColors[i % goalBarColors.length]}`} style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Notes</h3>
          <Link href="/notes" className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline">View all <ArrowUpRight size={11} /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : notes.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-600 text-center py-6">No notes yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notes.slice(0, 3).map((note, i) => {
              const accent = noteAccents[i % noteAccents.length]
              return (
                <Link key={note.id} href="/notes" className={`p-4 rounded-xl border ${accent.bg} ${accent.border} hover:shadow-sm transition-shadow`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${accent.dot}`} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{note.title}</p>
                  </div>
                  {note.body && <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{note.body}</p>}
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                    {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
