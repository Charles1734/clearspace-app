'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types'
import { Plus, FolderOpen, X, Loader2, Flag } from 'lucide-react'
import Link from 'next/link'

type ProjectStatus = 'active' | 'paused' | 'done'
type Filter = 'all' | 'active' | 'paused' | 'done'

const filterTabs: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'In Progress' },
  { key: 'paused', label: 'Paused' },
  { key: 'done', label: 'Done' },
]

// Avatar placeholder colors (like the screenshot's SL, AB, AL circles)
const avatarPalette = [
  { bg: 'bg-violet-500', initials: 'SL' },
  { bg: 'bg-pink-500',   initials: 'AB' },
  { bg: 'bg-emerald-500', initials: 'AL' },
  { bg: 'bg-amber-500',  initials: 'MK' },
  { bg: 'bg-sky-500',    initials: 'JD' },
]

// Status icon — matches the screenshot's colored indicators
function StatusIcon({ status }: { status: ProjectStatus }) {
  if (status === 'done') {
    return (
      <span className="w-[15px] h-[15px] rounded-sm bg-teal-500 flex items-center justify-center shrink-0">
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (status === 'paused') {
    return (
      <span className="w-[15px] h-[15px] rounded-full border-[1.5px] border-slate-300 dark:border-slate-600 flex items-center justify-center gap-[2.5px] shrink-0">
        <span className="w-[2px] h-[7px] bg-slate-300 dark:bg-slate-600 rounded-full" />
        <span className="w-[2px] h-[7px] bg-slate-300 dark:bg-slate-600 rounded-full" />
      </span>
    )
  }
  // active — orange circle with arrow
  return (
    <span className="w-[15px] h-[15px] rounded-full border-[1.5px] border-amber-400 flex items-center justify-center shrink-0">
      <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
        <path d="M1 1L5 4L1 7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', status: 'active' as ProjectStatus })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setProjects(data)
    setLoading(false)
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('projects')
      .insert({ title: form.title.trim(), description: form.description.trim() || null, status: form.status })
      .select().single()
    if (!error && data) {
      setProjects([data, ...projects])
      setForm({ title: '', description: '', status: 'active' })
      setShowModal(false)
    }
    setSaving(false)
  }

  async function deleteProject(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    await supabase.from('subtasks').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    setProjects(projects.filter(p => p.id !== id))
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="p-5">
      {/* Filter tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                filter === key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} /> New Project
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">

        {/* Column headers */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex-1 text-[11px] font-semibold text-gray-400 dark:text-[#555] uppercase tracking-wider">
            Projects
          </div>
          <div className="w-28 text-right text-[11px] font-semibold text-gray-400 dark:text-[#555] uppercase tracking-wider pr-1">
            Assignees
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-3 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-white/[0.03] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-[#555]">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-25" />
            <p className="text-[13px]">No projects here. Create your first one!</p>
          </div>
        ) : (
          <div>
            {filtered.map((project, i) => (
              <div
                key={project.id}
                className="group flex items-center px-4 py-[9px] border-b border-gray-50 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Row select checkbox */}
                <span className="w-4 h-4 rounded-full border border-gray-200 dark:border-[#333] mr-2.5 shrink-0 group-hover:border-gray-300 dark:group-hover:border-[#444] transition-colors" />

                {/* Status icon */}
                <span className="mr-2 shrink-0">
                  <StatusIcon status={project.status} />
                </span>

                {/* Flag icon */}
                <Flag size={12} className="mr-2.5 text-gray-300 dark:text-[#444] shrink-0" />

                {/* Project name — clickable */}
                <Link
                  href={`/projects/${project.id}`}
                  className="flex-1 text-[13px] text-gray-800 dark:text-[#d4d4d4] hover:text-gray-900 dark:hover:text-white truncate pr-3 min-w-0"
                >
                  {project.title}
                </Link>

                {/* Description snippet (if any) */}
                {project.description && (
                  <span className="hidden lg:flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#555] mr-4 shrink-0 max-w-[140px] truncate">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
                      <rect x="1" y="2" width="8" height="1.2" rx="0.6" fill="currentColor" />
                      <rect x="1" y="4.4" width="6" height="1.2" rx="0.6" fill="currentColor" />
                      <rect x="1" y="6.8" width="7" height="1.2" rx="0.6" fill="currentColor" />
                    </svg>
                    {project.description}
                  </span>
                )}

                {/* Assignee avatar */}
                <div className="flex items-center gap-[-4px] w-28 justify-end shrink-0">
                  <div className={`w-6 h-6 rounded-full ${avatarPalette[i % avatarPalette.length].bg} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#1a1a1a]`}>
                    {avatarPalette[i % avatarPalette.length].initials}
                  </div>
                </div>

                {/* Delete (hover only) */}
                <button
                  onClick={e => deleteProject(e, project.id)}
                  className="ml-2 p-1 text-gray-300 dark:text-[#444] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}

            {/* + New project row */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-2 px-4 py-[9px] text-[13px] text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <Plus size={13} />
              New project
            </button>
          </div>
        )}

        {/* Empty state + New project row */}
        {!loading && filtered.length === 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-2 px-4 py-[9px] border-t border-gray-50 dark:border-white/[0.04] text-[13px] text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#888] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <Plus size={13} />
            New project
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">New Project</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Project title"
                  autoFocus
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Description <span className="normal-case font-normal">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="active">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-[13px] text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
