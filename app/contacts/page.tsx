'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/types'
import { Plus, Trash2, Users, X, Mail, Building2, Briefcase } from 'lucide-react'

const avatarColors = [
  'bg-indigo-500', 'bg-orange-500', 'bg-teal-500',
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setContacts(data)
    setLoading(false)
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        role: form.role.trim() || null,
        notes: form.notes.trim() || null,
        tags: [],
      })
      .select()
      .single()
    if (!error && data) {
      setContacts([data, ...contacts])
      setForm({ name: '', email: '', company: '', role: '', notes: '' })
      setShowModal(false)
    }
    setSaving(false)
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    setContacts(contacts.filter(c => c.id !== id))
  }

  const filtered = search.trim()
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400 dark:text-slate-500">{contacts.length} people</p>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter contacts..."
            className="px-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} /> Add Contact
        </button>
      </div>

      {/* Contacts table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-50 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Name</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Company</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Role</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 w-16 text-right">Actions</p>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-slate-600">
            <Users size={36} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">{search ? 'No contacts match your search.' : 'No contacts yet. Add your first one!'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-slate-800/60">
            {filtered.map((contact, i) => (
              <div
                key={contact.id}
                className="group grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                    {initials(contact.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.name}</p>
                    {contact.email && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate flex items-center gap-1">
                        <Mail size={10} /> {contact.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company */}
                <div className="min-w-0">
                  {contact.company ? (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 truncate">
                      <Building2 size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                      {contact.company}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300 dark:text-slate-700">—</span>
                  )}
                </div>

                {/* Role */}
                <div className="min-w-0">
                  {contact.role ? (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 truncate">
                      <Briefcase size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
                      {contact.role}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300 dark:text-slate-700">—</span>
                  )}
                </div>

                {/* Delete */}
                <div className="w-16 flex justify-end">
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-1.5 text-gray-300 dark:text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Add Contact</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createContact} className="space-y-3">
              {[
                { field: 'name', label: 'Name', placeholder: 'Full name', required: true },
                { field: 'email', label: 'Email', placeholder: 'email@example.com', required: false },
                { field: 'company', label: 'Company', placeholder: 'Where they work', required: false },
                { field: 'role', label: 'Role', placeholder: 'Their title or role', required: false },
              ].map(({ field, label, placeholder, required }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form[field as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    autoFocus={field === 'name'}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any notes about this person..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                >
                  {saving ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
