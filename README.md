Tutor_Dev


Implemented a containerized, secure web application with a React-Three-Fiber frontend and a Node.js/Express backend, optimized for modularity and operational scalability. The homepage uses a 3D scene built with react-three-fiber to create an engaging initial user experience, while the remaining portal pages are lightweight 2D UIs (Tailwind CSS) focused on task efficiency. I built the entire stack for production using Docker Compose and implemented enterprise-grade security and event-driven architecture to enable real-world workflows.

Key contributions and responsibilities

Frontend: Architected a single-page app with a React + Vite build; built a 3D Home scene (react-three-fiber) and modular, accessible 2D portal pages (Tailwind CSS). Implemented Keycloak-based SSO via keycloak-js with a reusable provider and login components; integrated token usage for backend calls.

Backend: Implemented a Node.js/Express API with secure token verification (Keycloak introspection) and role-based access control (realm roles for student/teacher/parent/admin). Maintained separate DBs for Students, Parents, and Teachers (dedicated PostgreSQL instances) for data isolation and compliance with domain boundaries.

Security (Keycloak): Configured a Keycloak realm with public and confidential clients, service accounts, and realm roles. Implemented secure token introspection in the backend and client/session management in the frontend to enforce RBAC and protect endpoints.

Messaging (RabbitMQ): Integrated RabbitMQ as the event bus for decoupling services. (e.g., student_created/teacher_created/parent_created) to enable asynchronous processing, future microservices, and extensible notifications or audit pipelines.

Containerization & DevOps: Orchestrated Keycloak, RabbitMQ, multiple Postgres instances, backend, and production frontend via Docker Compose; added multi-stage Dockerfiles for production-grade builds, nginx static serving, persistent volumes, and environment-configured services.

Reliability & Observability: Added DB migrations/tables, startup retry patterns, and standardized logs to make containerized services resilient for local/integration testing.
