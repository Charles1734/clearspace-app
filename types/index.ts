export interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  status: 'active' | 'paused' | 'done'
  created_at: string
}

export interface Subtask {
  id: string
  project_id: string
  title: string
  completed: boolean
  created_at: string
}

export interface Note {
  id: string
  title: string
  body: string | null
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  title: string
  progress: number
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email: string | null
  company: string | null
  role: string | null
  notes: string | null
  tags: string[]
  created_at: string
}
