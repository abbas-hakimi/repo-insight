# Architecture

## Backend MVC convention

| Layer | Responsibility |
|-------|----------------|
| **routes** | HTTP paths, method mapping, middleware chain |
| **controllers** | Parse request, call services, shape HTTP response |
| **services** | Business logic, orchestration, external APIs |
| **models** | Mongoose schemas and data access |
| **validators** | Request body/query validation rules |
| **middleware** | Cross-cutting concerns (auth, errors) |

When adding a feature (e.g. `codebases`):

1. `models/codebase.model.js`
2. `services/codebase.service.js`
3. `controllers/codebase.controller.js`
4. `routes/codebase.routes.js`
5. Mount in `routes/index.js`

## Repository analysis (V4)

`POST /api/v1/repositories/analyze` — validates URL, ensures clone under `REPOS_CLONE_DIR`, returns `statistics`, hierarchical `fileTree` (depth/node capped), and `fileTreeMeta` when truncated. Skips `node_modules`, `.git`, `dist`, `build`, `coverage`. Requires **Git** on PATH.
