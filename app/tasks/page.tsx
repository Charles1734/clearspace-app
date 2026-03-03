'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

type Filter = 'all' | 'high' | 'medium' | 'low' | 'pending' | 'done'
type Priority = 'high' | 'medium' | 'low'

const priorityConfig = {
  high: {
    label: 'High',
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  medium: {
    label: 'Medium',
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  low: {
    label: 'Low',
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },

}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setTasks(data)
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTitle.trim(), priority: newPriority, completed: false })
      .select()
      .single()
    if (!error && data) {
      setTasks([data, ...tasks])
      setNewTitle('')
    }
  }

  async function toggleTask(task: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
    if (!error) {
      setTasks(tasks.map(t => (t.id === task.id ? { ...t, completed: !t.completed } : t)))
    }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(tasks.filter(t => t.id !== id))
  }

  const filtered = (() => {
    if (filter === 'pending') return tasks.filter(t => !t.completed)
    if (filter === 'done') return tasks.filter(t => t.completed)
    if (filter === 'all') return tasks
    return tasks.filter(t => t.priority === filter)
  })()
  const completedCount = tasks.filter(t => t.completed).length

  const filterTabs = [
    { key: 'all', label: 'All Tasks' },
    { key: 'pending', label: 'Pending' },
    { key: 'done', label: 'Done' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500">{completedCount} of {tasks.length} completed</p>
        </div>
        <form onSubmit={addTask} className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New task name..."
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
          />
          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as Priority)}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button type="submit" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={15} /> Add Task
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as Filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-600">
          <CheckCircle2 size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">No tasks here. Add one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(task => (
            <div
              key={task.id}
              className={`group relative flex items-start gap-3 p-4 rounded-2xl border-l-4 ${priorityConfig[task.priority].border} ${
                task.completed
                  ? 'bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800'
                  : `${priorityConfig[task.priority].bg} border border-transparent`
              }`}
            >
              <button
                onClick={() => toggleTask(task)}
                className={`shrink-0 mt-0.5 transition-colors ${task.completed ? 'text-indigo-500' : 'text-gray-300 dark:text-slate-600 hover:text-indigo-400'}`}
              >
                {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-gray-400 dark:text-slate-600' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </p>
                <span className={`inline-flex mt-2 text-xs font-semibold px-2 py-0.5 rounded-lg ${priorityConfig[task.priority].badge}`}>
                  {priorityConfig[task.priority].label}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
