# Tutor Backend

A minimal backend scaffold for the TutoringDE project. It includes a small Express server and connects to separate Postgres databases for Students, Parents, and Teachers, and RabbitMQ for messaging. The server can optionally use Keycloak for token introspection authentication.

## Run locally using Docker Compose

```bash
docker compose up --build
```

Services created by the compose file:
- Keycloak (http://localhost:8080)
- RabbitMQ management (http://localhost:15672)
- Students DB (Postgres, host: localhost:5432)
- Parents DB (Postgres, host: localhost:5433)
- Teachers DB (Postgres, host: localhost:5434)
- Backend (http://localhost:4000)
 - Frontend (http://localhost:5173) — built and served by nginx from the `frontend` service

### Keycloak clients & test users

- Frontend client:
	- clientId: `frontend` (public client)
	- redirectUris: `http://localhost:5173/*`
	- example use: front-end OIDC (login with Keycloak)

- Backend client:
	- clientId: `backend-service` (confidential client)
	- secret: `verysecret` (used by backend for token introspection/service account)

Test users (imported in the realm export):
- `alice` / `password` → realm role: `student`
- `bob` / `password` → realm role: `teacher`
- `carol` / `password` → realm role: `parent`
- `superadmin` / `admin` → realm role: `admin`

## API Endpoints
- GET /health
- GET /students
- POST /students
- GET /teachers
- POST /teachers
- GET /parents
- POST /parents

All POST endpoints require a JSON body.

## Notes
- Replace default credentials in `docker-compose.yml` and `keycloak/realm-export.json` for production.
- The Keycloak realm import is done by mounting realm-export.json; double-check the Keycloak image docs if import issues occur.
- For production, consider using a single managed Postgres instance and separate schemas instead of several containers.
