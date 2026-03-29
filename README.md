# AI Playlist Web App

A React + Vite music web app for generating AI-assisted playlists, tracking listening behavior, and managing account-based features with Supabase authentication.

## Stack

- React 19
- Vite 7
- Framer Motion
- Tailwind CSS 4
- Supabase JavaScript client

## Current Features

- Email/password account signup and login
- Supabase session handling
- AI-style playlist generation flow
- Playlist favorites and recently played tracking
- DJ mode with skip-aware queue behavior
- Responsive layout for mobile, tablet, and desktop
- Bottom player with collapsible mini-player state

## Project Structure

```text
src/
  App.jsx              Main app UI and feature logic
  main.jsx             React entry point
  styles.css           Global styles
  lib/
    supabase.js        Supabase client setup
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

This project also supports the legacy key name:

```env
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

Do not use a Supabase service role key in the frontend.

### 3. Run the app

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Supabase Notes

- Email/password auth is currently enabled in the UI.
- Google login is intentionally removed for now.
- If you enable additional auth providers later, update the Supabase project auth settings and redirect URLs before wiring them into the app.

## Git Ignore

The repo includes a `.gitignore` for:

- `node_modules`
- Vite build output
- environment files
- editor/system files
- logs

## Next Recommended Steps

- Move app data such as favorites, recently played, and analytics into Supabase tables
- Split large app logic out of `src/App.jsx` into feature modules
- Add route-level structure if the app grows beyond a single-screen experience
