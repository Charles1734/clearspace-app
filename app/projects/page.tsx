'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types'
import { Plus, FolderOpen, X, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type ProjectStatus = 'active' | 'paused' | 'done'
type Filter = 'all' | 'active' | 'paused' | 'done'

const filterTabs: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'In Progress' },
  { key: 'paused', label: 'Paused' },
  { key: 'done', label: 'Done' },
]

const cardGradients = [
  'from-violet-500 via-purple-600 to-indigo-700',
  'from-amber-400 via-orange-500 to-red-500',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-rose-400 via-pink-500 to-fuchsia-600',
  'from-sky-400 via-blue-500 to-indigo-600',
  'from-lime-400 via-green-500 to-teal-600',
]

const statusPill: Record<ProjectStatus, string> = {
  active: 'bg-amber-100/80 text-amber-800',
  paused: 'bg-slate-100/80 text-slate-600',
  done: 'bg-emerald-100/80 text-emerald-800',
}
const statusLabel: Record<ProjectStatus, string> = {
  active: 'In Progress',
  paused: 'Paused',
  done: 'Done',
}

function CardPattern({ idx }: { idx: number }) {
  const n = idx % 4
  if (n === 0) return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice">
      <circle cx="130" cy="20" r="65" fill="white" fillOpacity="0.07" />
      <circle cx="10" cy="90" r="40" fill="white" fillOpacity="0.05" />
    </svg>
  )
  if (n === 1) return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice">
      <rect x="90" y="-10" width="2" height="130" fill="white" fillOpacity="0.08" transform="rotate(20 90 55)" />
      <rect x="140" y="-10" width="2" height="130" fill="white" fillOpacity="0.06" transform="rotate(20 140 55)" />
      <rect x="40" y="-10" width="2" height="130" fill="white" fillOpacity="0.05" transform="rotate(20 40 55)" />
    </svg>
  )
  if (n === 2) return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice">
      {[30, 75, 120, 160].map(x => [20, 55, 90].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="white" fillOpacity="0.1" />
      )))}
    </svg>
  )
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice">
      <path d="M -10 80 Q 90 -30 200 70" stroke="white" strokeWidth="2.5" fill="none" strokeOpacity="0.12" />
      <path d="M -10 100 Q 90 -10 200 90" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.07" />
    </svg>
  )
}

const containerAnim = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
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
      .select()
      .single()
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
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
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

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 dark:text-slate-600">
          <FolderOpen size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-[13px]">No projects here. Create your first one!</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerAnim}
          initial="hidden"
          animate="show"
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              variants={cardAnim}
              whileHover={{
                y: -6,
                boxShadow: '0 20px 40px rgba(0,0,0,0.13)',
                transition: { type: 'spring', stiffness: 300, damping: 22 },
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#1c1c1c] shadow-sm"
            >
              {/* Gradient header */}
              <div className={`relative h-32 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} overflow-hidden shrink-0`}>
                <CardPattern idx={i} />
                <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${statusPill[project.status]}`}>
                  {statusLabel[project.status]}
                </span>
                <button
                  onClick={e => deleteProject(e, project.id)}
                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/25 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/45 transition-all"
                >
                  <X size={11} />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug mb-2">
                  {project.title}
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-slate-400 flex-1 line-clamp-2 leading-relaxed">
                  {project.description || 'No description added yet.'}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-50 dark:border-white/[0.05]">
                  <span className="text-[11px] text-gray-400 dark:text-slate-500">
                    {new Date(project.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group/btn flex items-center gap-1 text-[12px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Project
                    <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">New Project</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={createProject} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Project title"
                  autoFocus
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="active">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-800 dark:text-slate-400">
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
          </motion.div>
        </div>
      )}
    </div>
  )
}
