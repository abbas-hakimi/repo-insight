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

## Repository analysis (V2)

`POST /api/v1/repositories/analyze` — validates a GitHub URL, ensures a shallow clone exists under `REPOS_CLONE_DIR` (`{owner}-{repo}`), reuses existing clones, returns `owner`, `repositoryName`, and `localPath`. Requires **Git** on PATH.
