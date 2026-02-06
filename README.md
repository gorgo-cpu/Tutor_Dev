# Tutor_Dev

A tutoring portal demo with a React (Vite) frontend and Supabase (Auth + Postgres) backend. The homepage is a 3D scene built with React Three Fiber, while the dashboards are lightweight Tailwind UIs (Students / Parents / Teachers) with weekly calendar views (react-big-calendar).

## Architecture
- **Frontend**: Vite + React SPA (3D Home + dashboards). Embedded email/password login + signup via Supabase Auth.
- **Database**: Supabase Postgres with RLS policies and RPC functions for safe, atomic booking.
- **Backend**: ASP.NET Core API for privileged/admin operations (role approval, seeding teacher availability). Uses the Supabase **service role key** server-side only.

## Setup
1) **Create Supabase project** and copy your project URL + anon key.
2) In Supabase SQL editor, run `supabase/schema.sql`.
3) Configure auth confirmation policy in Supabase:
   - **Dev**: disable email confirmation for faster iteration.
   - **Prod**: enable email confirmation; the UI will show a “check your email” state on signup until the user verifies and signs in.
4) Create a local `.env` based on `.env.example`.
5) Install and run the frontend:
   - `npm install`
   - `npm run dev`

## Roles and approval flow
- Signup collects a **requested role** (`student`, `parent`, `teacher`). This is stored as `profiles.requested_role`.
- `profiles.role` is **not client-writable**; it must be approved by an admin.
- Until approved, the UI shows “Pending approval” instead of dashboards.

## Admin backend (optional but recommended)
The .NET backend is used for admin actions and must be configured with:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `ADMIN_API_KEY` (simple header check for dev)

Examples (dev):
- Approve role (uses `requested_role` when `role` is omitted):
  - `POST http://localhost:4000/admin/approve-role` with header `X-Admin-Key: <ADMIN_API_KEY>` and JSON `{ "userId": "<uuid>" }`
- Link parent to student:
  - `POST http://localhost:4000/admin/link-parent-student` with JSON `{ "parentId": "<uuid>", "studentId": "<uuid>" }`
- Seed teacher availability:
  - `POST http://localhost:4000/admin/seed-availability` with JSON `{ "teacherId": "<uuid>" }`

## Booking
Parents book sessions by calling the Postgres RPC function `book_slot(...)` via `supabase.rpc`.
The function enforces:
- parent/student linkage (`parent_students`)
- atomic booking (locks availability row)
- teacher + student conflict checks
