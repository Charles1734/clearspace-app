'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'
import { Plus, Trash2, FileText } from 'lucide-react'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) {
      setNotes(data)
      if (data.length > 0) {
        selectNote(data[0])
      }
    }
    setLoading(false)
  }

  function selectNote(note: Note) {
    setSelected(note)
    setEditTitle(note.title)
    setEditBody(note.body || '')
    setIsDirty(false)
  }

  const saveNote = useCallback(async (noteId: string, title: string, body: string) => {
    setSaving(true)
    const updatedAt = new Date().toISOString()
    await supabase
      .from('notes')
      .update({ title: title.trim() || 'Untitled note', body, updated_at: updatedAt })
      .eq('id', noteId)
    setNotes(prev =>
      prev.map(n =>
        n.id === noteId
          ? { ...n, title: title.trim() || 'Untitled note', body, updated_at: updatedAt }
          : n
      )
    )
    setSaving(false)
  }, [])

  // Auto-save on edits (debounced 700ms)
  useEffect(() => {
    if (!selected || !isDirty) return
    const timer = setTimeout(() => {
      saveNote(selected.id, editTitle, editBody)
      setIsDirty(false)
    }, 700)
    return () => clearTimeout(timer)
  }, [editTitle, editBody, selected, isDirty, saveNote])

  async function createNote() {
    const { data } = await supabase
      .from('notes')
      .insert({ title: 'Untitled note', body: '' })
      .select()
      .single()
    if (data) {
      setNotes([data, ...notes])
      selectNote(data)
    }
  }

  async function deleteNote(noteId: string) {
    await supabase.from('notes').delete().eq('id', noteId)
    const remaining = notes.filter(n => n.id !== noteId)
    setNotes(remaining)
    if (selected?.id === noteId) {
      if (remaining.length > 0) selectNote(remaining[0])
      else setSelected(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Notes List Panel */}
      <div className="w-60 shrink-0 border-r border-gray-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Notes
          </span>
          <button
            onClick={createNote}
            className="p-1 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="New note"
          >
            <Plus size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-slate-600">
              <FileText size={22} className="mb-2 opacity-30" />
              <p className="text-xs">No notes yet</p>
            </div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                  selected?.id === note.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-2 border-l-indigo-500 pl-3.5'
                    : ''
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {note.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {formatDate(note.updated_at)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {selected ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center gap-3 px-8 py-4 border-b border-gray-100 dark:border-slate-800">
              <input
                type="text"
                value={editTitle}
                onChange={e => {
                  setEditTitle(e.target.value)
                  setIsDirty(true)
                }}
                className="flex-1 text-lg font-semibold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-300 dark:placeholder:text-slate-700"
                placeholder="Note title"
              />
              <div className="flex items-center gap-3">
                {saving && (
                  <span className="text-xs text-gray-400 dark:text-slate-600">Saving...</span>
                )}
                <button
                  onClick={() => deleteNote(selected.id)}
                  className="p-1.5 text-gray-300 dark:text-slate-700 hover:text-red-400 transition-colors"
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={editBody}
              onChange={e => {
                setEditBody(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Start writing..."
              className="flex-1 px-8 py-5 text-sm text-gray-700 dark:text-slate-300 bg-transparent focus:outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-slate-700 leading-relaxed"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-600">
            <FileText size={36} className="mb-3 opacity-20" />
            <p className="text-sm mb-4">No note selected</p>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus size={15} />
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
