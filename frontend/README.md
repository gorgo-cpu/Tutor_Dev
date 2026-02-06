# Frontend

Vite + React (React Three Fiber) single-page app.

## Auth (Supabase)
- Embedded email/password login + signup via Supabase Auth.
- Signup collects a **requested role** (student/parent/teacher). Dashboards unlock only after an admin approves the role.

## Configure
Set environment variables (see `.env.example`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Run (local)
```bash
npm install
npm run dev
```

## Run (Docker Compose production build)
Docker builds the static frontend and serves it via nginx:
```bash
docker compose up --build -d
```
Frontend: http://localhost:5173

