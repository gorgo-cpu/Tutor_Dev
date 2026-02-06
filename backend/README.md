# Backend (.NET)

Small ASP.NET Core API for privileged/admin operations. It uses the Supabase **service role key** server-side only.

## Environment variables
- `SUPABASE_URL` (e.g. `https://YOUR_PROJECT_REF.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` (keep secret; never expose to the frontend)
- `ADMIN_API_KEY` (simple dev-only admin auth)

## Run (local)
```bash
dotnet run --project backend/TutorBackend.csproj
```
API: http://localhost:4000

## Endpoints
- `GET /health`

Admin (requires header `X-Admin-Key: <ADMIN_API_KEY>`):
- `POST /admin/approve-role` body: `{ "userId": "<uuid>", "role": "student|parent|teacher|admin" }`
  - If `role` is omitted, it uses `profiles.requested_role`.
- `POST /admin/seed-teachers` body:
  - `{ "teachers": [{ "userId": "<uuid>", "displayName": "Ms. Rivera", "subjects": ["A1 Grammar"] }] }`
- `POST /admin/seed-availability` body:
  - `{ "teacherId": "<uuid>", "days": 5, "slotsPerDay": 2, "slotMinutes": 60 }`
- `POST /admin/link-parent-student` body:
  - `{ "parentId": "<uuid>", "studentId": "<uuid>" }`

