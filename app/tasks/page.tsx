'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

type Filter = 'all' | 'high' | 'medium' | 'low'
type Priority = 'high' | 'medium' | 'low'

const priorityConfig = {
  high: {
    label: 'High',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  low: {
    label: 'Low',
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

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.priority === filter)
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <span className="text-sm text-gray-400 dark:text-slate-500">
            {completedCount}/{tasks.length} done
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Manage and prioritize your daily tasks
        </p>
      </div>

      {/* Add Task */}
      <form
        onSubmit={addTask}
        className="mb-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 flex gap-3 items-center"
      >
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none"
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as Priority)}
          className="text-xs font-medium rounded-lg px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Add
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'high', 'medium', 'low'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
            }`}
          >
            {f === 'all' ? 'All tasks' : f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-14 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-slate-600">
          <CheckCircle2 size={32} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">
            {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} priority tasks.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div
              key={task.id}
              className="group flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 px-4 py-3.5 hover:border-gray-200 dark:hover:border-slate-700 transition-colors"
            >
              <button
                onClick={() => toggleTask(task)}
                className={`shrink-0 transition-colors ${
                  task.completed
                    ? 'text-indigo-500'
                    : 'text-gray-300 dark:text-slate-700 hover:text-indigo-400'
                }`}
              >
                {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>

              <span
                className={`flex-1 text-sm ${
                  task.completed
                    ? 'line-through text-gray-400 dark:text-slate-600'
                    : 'text-gray-800 dark:text-slate-200'
                }`}
              >
                {task.title}
              </span>

              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  priorityConfig[task.priority].badge
                }`}
              >
                {priorityConfig[task.priority].label}
              </span>

              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
