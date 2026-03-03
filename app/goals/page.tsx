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

  const barColors = ['bg-indigo-500', 'bg-orange-500', 'bg-teal-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500']
  const completedCount = goals.filter(g => g.progress >= 100).length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header + Add */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-400 dark:text-slate-500">{completedCount} of {goals.length} achieved</p>
        <form onSubmit={addGoal} className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New goal..."
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
          />
          <button type="submit" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus size={15} /> Add Goal
          </button>
        </form>
      </div>

      {/* Goals — invoice-overview style */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Goal Progress</h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-5">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-slate-600">
            <Target size={36} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">No goals yet. Set your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {goals.map((goal, i) => (
              <div key={goal.id} className="group px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${goal.progress >= 100 ? 'bg-emerald-500' : barColors[i % barColors.length]}`} />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{goal.title}</h3>
                    {goal.progress >= 100 && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">Achieved!</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className={`text-sm font-bold tabular-nums ${goal.progress >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {goal.progress}%
                    </span>
                    <button onClick={() => deleteGoal(goal.id)} className="text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${goal.progress >= 100 ? 'bg-emerald-500' : barColors[i % barColors.length]}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={goal.progress}
                    onChange={e => updateProgress(goal, Number(e.target.value))}
                    className="w-28 shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
