'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project, Subtask } from '@/types'
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react'

type ProjectStatus = 'active' | 'paused' | 'done'

const statusConfig = {
  active: {
    label: 'In Progress',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  paused: {
    label: 'Paused',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  done: {
    label: 'Done',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  },
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

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    const [projectRes, subtasksRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('subtasks').select('*').eq('project_id', id).order('created_at', { ascending: true }),
    ])
    if (projectRes.data) setProject(projectRes.data)
    if (subtasksRes.data) setSubtasks(subtasksRes.data)
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
      .select()
      .single()
    if (!error && data) {
      setSubtasks([...subtasks, data])
      setNewSubtask('')
    }
    setAddingSubtask(false)
  }

  async function toggleSubtask(subtask: Subtask) {
    await supabase.from('subtasks').update({ completed: !subtask.completed }).eq('id', subtask.id)
    setSubtasks(subtasks.map(s => (s.id === subtask.id ? { ...s, completed: !s.completed } : s)))
  }

  async function deleteSubtask(subtaskId: string) {
    await supabase.from('subtasks').delete().eq('id', subtaskId)
    setSubtasks(subtasks.filter(s => s.id !== subtaskId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={22} className="animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-slate-400">
        <p>Project not found.</p>
      </div>
    )
  }

  const doneCount = subtasks.filter(s => s.completed).length
  const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/projects')}
        className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Projects
      </button>

      {/* Project Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {project.title}
          </h2>
          <select
            value={project.status}
            onChange={e => updateStatus(e.target.value as ProjectStatus)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shrink-0 ${statusConfig[project.status].badge}`}
          >
            <option value="active">In Progress</option>
            <option value="paused">Paused</option>
            <option value="done">Done</option>
          </select>
        </div>

        {project.description && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}

        {subtasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 mb-1.5">
              <span>{doneCount} of {subtasks.length} tasks complete</span>
              <span className="font-bold text-gray-700 dark:text-slate-300">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Checklist Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Checklist</h3>
        </div>

        {subtasks.length > 0 && (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="group flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <button
                  onClick={() => toggleSubtask(subtask)}
                  className={`shrink-0 transition-colors ${
                    subtask.completed
                      ? 'text-indigo-500'
                      : 'text-gray-300 dark:text-slate-700 hover:text-indigo-400'
                  }`}
                >
                  {subtask.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? 'line-through text-gray-400 dark:text-slate-600'
                      : 'text-gray-800 dark:text-slate-200'
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  className="shrink-0 text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Subtask */}
        <form
          onSubmit={addSubtask}
          className="flex items-center gap-3 px-6 py-3.5 border-t border-gray-50 dark:border-slate-800/60"
        >
          <Plus size={15} className="shrink-0 text-gray-300 dark:text-slate-700" />
          <input
            type="text"
            value={newSubtask}
            onChange={e => setNewSubtask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none"
          />
          {newSubtask.trim() && (
            <button
              type="submit"
              disabled={addingSubtask}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50 transition-colors"
            >
              {addingSubtask ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
