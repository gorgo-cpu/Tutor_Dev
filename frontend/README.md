# Frontend — Keycloak demo

This frontend is a Vite + React app (Three.js) served by nginx in production mode.

## Keycloak demo
- The app includes a Keycloak demo login page (`Login.jsx`) which uses `keycloak-js`.
- Click **Login with Keycloak** to log into Keycloak using one of the test users (e.g., `alice / password`).
- After login, the page can call the backend protected endpoints with a bearer token (e.g., `GET /students`).

## Start (local/docker)
- Build and serve with Docker Compose (production):

```bash
docker compose up --build -d
```

- Frontend: http://localhost:5173
- Keycloak: http://localhost:8080

## Notes
- The Keycloak server is configured to allow the `frontend` client with redirect URIs for `http://localhost:5173/*`.
- For local dev, consider running `npm run dev` and opening http://localhost:5173 directly.
- If using Docker, the frontend is accessible at `http://localhost:5173` and Keycloak at `http://localhost:8080`.
