'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types'
import { Plus, FolderOpen, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

type ProjectStatus = 'active' | 'paused' | 'done'

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  paused: {
    label: 'Paused',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  done: {
    label: 'Done',
    color: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400',
  },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', status: 'active' as ProjectStatus })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

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
      .insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
      })
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Projects</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Track your ongoing projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 text-gray-400 dark:text-slate-600">
          <FolderOpen size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="group relative bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5 hover:border-indigo-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
            >
              <button
                onClick={e => deleteProject(e, project.id)}
                className="absolute top-3.5 right-3.5 p-1 text-gray-300 dark:text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>

              <Link href={`/projects/${project.id}`} className="block">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 pr-5 leading-snug">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <span
                    className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-md ${
                      statusConfig[project.status].color
                    }`}
                  >
                    {statusConfig[project.status].label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-600">
                    {new Date(project.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                New Project
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Project title"
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Description{' '}
                  <span className="font-normal text-gray-400 dark:text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.title.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
