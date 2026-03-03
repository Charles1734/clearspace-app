# Clearspace

A minimal life organizer built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- **Tasks** — Add, complete, and delete tasks with high/medium/low priority tags and filter by priority
- **Projects** — Create projects with title, description, and status (active/paused/done); each project has its own sub-task checklist with a progress bar
- **Notes** — Create, edit, and delete notes with a title and freeform body; auto-saves as you type
- **Goals** — Set goals and manually update progress from 0–100% using a slider

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + JS client)
- Deploy-ready for [Vercel](https://vercel.com/)

---

## Setup

### 1. Clone and install dependencies

```bash
cd clearspace
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public** key

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create the database tables

In your Supabase project, go to the **SQL Editor** and run the following:

```sql
-- Tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Subtasks
CREATE TABLE subtasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON subtasks FOR ALL USING (true) WITH CHECK (true);

-- Notes
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled note',
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON notes FOR ALL USING (true) WITH CHECK (true);

-- Goals
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON goals FOR ALL USING (true) WITH CHECK (true);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Vercel

1. Push your project to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Project Structure

```
clearspace/
├── app/
│   ├── layout.tsx          # Root layout with sidebar + topbar
│   ├── page.tsx            # Redirects to /tasks
│   ├── globals.css
│   ├── tasks/page.tsx      # Tasks CRUD with priority filtering
│   ├── projects/
│   │   ├── page.tsx        # Projects grid
│   │   └── [id]/page.tsx   # Project detail + subtask checklist
│   ├── notes/page.tsx      # Split-panel note editor
│   └── goals/page.tsx      # Goals with progress sliders
├── components/
│   ├── ThemeProvider.tsx   # Dark mode context + toggle logic
│   ├── Sidebar.tsx         # Navigation sidebar
│   └── TopBar.tsx          # Top bar with dark mode toggle
├── lib/
│   └── supabase.ts         # Supabase client singleton
├── types/
│   └── index.ts            # TypeScript interfaces
└── .env.local              # Your Supabase credentials (gitignored)
```
