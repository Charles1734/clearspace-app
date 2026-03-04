'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project, Subtask } from '@/types'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Plus, CheckCircle2, Circle, Trash2,
  Loader2, Share2, Edit2, X, FileText, Paperclip, Users,
  Calendar, Tag, MoreHorizontal, Download,
} from 'lucide-react'

type ProjectStatus = 'active' | 'paused' | 'done'

const statusStyles: Record<ProjectStatus, { label: string; badge: string; dot: string }> = {
  active:  { label: 'In Progress', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700/60', dot: 'bg-amber-500 animate-pulse' },
  paused:  { label: 'Paused',      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60', dot: 'bg-gray-400' },
  done:    { label: 'Done',        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/60', dot: 'bg-emerald-500' },
}

const subtaskStatusStyles: Record<string, string> = {
  Completed:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/60',
  'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-700/60',
  Pending:     'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60',
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [newSubtask, setNewSubtask] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)

  useEffect(() => { if (id) fetchData() }, [id])

  async function fetchData() {
    const [pRes, sRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('subtasks').select('*').eq('project_id', id).order('created_at', { ascending: true }),
    ])
    if (pRes.data) setProject(pRes.data)
    if (sRes.data) setSubtasks(sRes.data)
    setLoading(false)
  }

  async function updateStatus(status: ProjectStatus) {
    if (!project) return
    await supabase.from('projects').update({ status }).eq('id', project.id)
    setProject({ ...project, status })
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubtask.trim() || !id) return
    setAddingSubtask(true)
    const { data, error } = await supabase
      .from('subtasks')
      .insert({ project_id: id, title: newSubtask.trim(), completed: false })
      .select().single()
    if (!error && data) { setSubtasks([...subtasks, data]); setNewSubtask('') }
    setAddingSubtask(false)
  }

  async function toggleSubtask(st: Subtask) {
    await supabase.from('subtasks').update({ completed: !st.completed }).eq('id', st.id)
    setSubtasks(subtasks.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))
  }

  async function deleteSubtask(stId: string) {
    await supabase.from('subtasks').delete().eq('id', stId)
    setSubtasks(subtasks.filter(s => s.id !== stId))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={22} className="animate-spin text-indigo-500" />
    </div>
  )

  if (!project) return (
    <div className="p-6 text-center text-gray-500 dark:text-slate-400">Project not found.</div>
  )

  const doneCount = subtasks.filter(s => s.completed).length
  const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0
  const cfg = statusStyles[project.status]
  const createdDate = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={container}>

        {/* ── Breadcrumb header ── */}
        <motion.div variants={item} className="flex items-center justify-between mb-6 p-3 rounded-xl bg-white dark:bg-[#1c1c1c] border border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-slate-400">
            <button onClick={() => router.push('/projects')} className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Projects
            </button>
            <span className="text-gray-300 dark:text-slate-700">/</span>
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[240px]">{project.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-slate-300 transition-colors"><Share2 size={14} /></button>
            <button className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-slate-300 transition-colors"><Edit2 size={14} /></button>
            <button onClick={() => router.push('/projects')} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-slate-300 transition-colors"><X size={14} /></button>
          </div>
        </motion.div>

        {/* ── Title ── */}
        <motion.h1 variants={item} className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
          {project.title}
        </motion.h1>

        {/* ── Meta grid ── */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 p-5 rounded-2xl bg-white dark:bg-[#1c1c1c] border border-gray-100 dark:border-white/[0.06]">
          {/* Status */}
          <div className="flex items-start gap-3">
            <MoreHorizontal size={16} className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Status</p>
              <select
                value={project.status}
                onChange={e => updateStatus(e.target.value as ProjectStatus)}
                className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${cfg.badge}`}
              >
                <option value="active">In Progress</option>
                <option value="paused">Paused</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-start gap-3">
            <Users size={16} className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white">C</div>
                <span className="text-[13px] font-medium text-gray-700 dark:text-slate-300">You</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar size={16} className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Date</p>
              <p className="text-[13px] font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                {createdDate} <ArrowRight size={12} className="text-gray-400" /> {project.status === 'done' ? 'Completed' : 'Ongoing'}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-start gap-3">
            <Tag size={16} className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Tags</p>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="flex items-start gap-3 sm:col-span-2">
              <FileText size={16} className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Description</p>
                <p className="text-[13px] text-gray-700 dark:text-slate-300 leading-relaxed">{project.description}</p>
              </div>
            </div>
          )}

          {/* Progress */}
          {subtasks.length > 0 && (
            <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
              <div className="w-4 shrink-0 mt-0.5 text-gray-400 dark:text-slate-500 flex items-center justify-center">
                <span className="text-[11px] font-bold">{progress}%</span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
                  Progress — {doneCount} of {subtasks.length} tasks complete
                </p>
                <div className="h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Attachments ── */}
        <motion.div variants={item} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Paperclip size={14} className="text-gray-400 dark:text-slate-500" />
              Attachments
              <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md">0</span>
            </h3>
            <button className="flex items-center gap-1 text-[12px] text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">
              <Download size={12} /> Download All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Add attachment slot */}
            <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 dark:border-white/[0.07] rounded-xl cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors text-gray-400 dark:text-slate-600 hover:text-indigo-500">
              <Plus size={18} />
            </div>
          </div>
        </motion.div>

        {/* ── Task list table ── */}
        <motion.div variants={item}>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white mb-3">Task List</h3>
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_100px_120px_100px] gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-white/[0.05]">
              {['No', 'Task', 'Category', 'Status', 'Created'].map(h => (
                <p key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{h}</p>
              ))}
            </div>

            {/* Subtask rows */}
            {subtasks.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-slate-600">
                <p className="text-[13px]">No tasks yet. Add one below.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {subtasks.map((st, idx) => {
                  const rowStatus = st.completed ? 'Completed' : 'In Progress'
                  return (
                    <div
                      key={st.id}
                      className="group grid grid-cols-[40px_1fr_100px_120px_100px] gap-3 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-[12px] text-gray-400 dark:text-slate-600">{idx + 1}</span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleSubtask(st)}
                          className={`shrink-0 transition-colors ${st.completed ? 'text-indigo-500' : 'text-gray-300 dark:text-slate-700 hover:text-indigo-400'}`}
                        >
                          {st.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <span className={`text-[13px] truncate ${st.completed ? 'line-through text-gray-400 dark:text-slate-600' : 'text-gray-800 dark:text-slate-200'}`}>
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[12px] text-gray-500 dark:text-slate-400">General</span>
                      <span>
                        <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-lg ${subtaskStatusStyles[rowStatus]}`}>
                          {rowStatus}
                        </span>
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 dark:text-slate-500">
                          {new Date(st.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button
                          onClick={() => deleteSubtask(st.id)}
                          className="p-1 text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add task row */}
            <form
              onSubmit={addSubtask}
              className="flex items-center gap-3 px-4 py-3 border-t border-gray-50 dark:border-white/[0.05]"
            >
              <span className="text-[12px] text-gray-300 dark:text-slate-700 w-[28px]">{subtasks.length + 1}</span>
              <Plus size={13} className="shrink-0 text-gray-300 dark:text-slate-700" />
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 text-[13px] bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none"
              />
              {newSubtask.trim() && (
                <button
                  type="submit"
                  disabled={addingSubtask}
                  className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {addingSubtask ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
                </button>
              )}
            </form>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
