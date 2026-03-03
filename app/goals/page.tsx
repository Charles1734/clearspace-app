'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types'
import { Plus, Trash2, Target } from 'lucide-react'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setGoals(data)
    setLoading(false)
  }

  async function addGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    const { data } = await supabase
      .from('goals')
      .insert({ title: newTitle.trim(), progress: 0 })
      .select()
      .single()
    if (data) {
      setGoals([data, ...goals])
      setNewTitle('')
    }
  }

  async function updateProgress(goal: Goal, progress: number) {
    await supabase.from('goals').update({ progress }).eq('id', goal.id)
    setGoals(goals.map(g => (g.id === goal.id ? { ...g, progress } : g)))
  }

  async function deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(goals.filter(g => g.id !== id))
  }

  const progressColor = (p: number) => {
    if (p >= 100) return 'bg-emerald-500'
    if (p >= 66) return 'bg-indigo-500'
    if (p >= 33) return 'bg-indigo-400'
    return 'bg-indigo-300'
  }

  const completedCount = goals.filter(g => g.progress >= 100).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Goals</h2>
          {goals.length > 0 && (
            <span className="text-sm text-gray-400 dark:text-slate-500">
              {completedCount}/{goals.length} complete
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Set and track your long-term goals
        </p>
      </div>

      {/* Add Goal */}
      <form
        onSubmit={addGoal}
        className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 flex gap-3 items-center"
      >
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new goal..."
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Add
        </button>
      </form>

      {/* Goals List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-600">
          <Target size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">No goals yet. Set your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => (
            <div
              key={goal.id}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5"
            >
              {/* Title row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full transition-colors ${
                      goal.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-400'
                    }`}
                  />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {goal.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      goal.progress >= 100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {goal.progress}%
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressColor(goal.progress)}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={e => updateProgress(goal, Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-300 dark:text-slate-700 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>

              {goal.progress >= 100 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2.5">
                  Goal achieved!
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
