# TrampoHub Frontend

The Angular frontend for TrampoHub, a job board (vagas) platform. Consumes the [trampohub-api](https://github.com/axandrade/trampohub-api) REST backend and includes a full local CI/CD pipeline with Jenkins, SonarQube, and Docker.

This project was built as a hands-on learning exercise, applying an existing **Angular** background to a real end-to-end delivery pipeline — from local development through automated testing, static analysis, containerization, and deployment to an isolated homologation environment.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Environments](#environments)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Building for Homologation](#building-for-homologation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Local Pipeline Infrastructure](#local-pipeline-infrastructure)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 22 (standalone components) |
| UI Components | PrimeNG / PrimeIcons |
| Language | TypeScript |
| Testing | Karma + Jasmine, headless Chrome (via `@puppeteer/browsers`) |
| Containerization | Docker (multi-stage build), Nginx (static file serving) |
| CI/CD | Jenkins (Declarative Pipeline) |
| Code quality | SonarQube Community Edition |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Jenkins (CI/CD)                        │
│                                                                 │
│  Checkout → Unit Tests (headless Chrome) → SonarQube →        │
│  Docker Build → Deploy to Homolog                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────┐         ┌───────────────────────┐
│  Dev (ng serve)          │         │  Homolog (Docker/Nginx) │
│                          │         │                          │
│  :4200 → API :8000        │         │  :4001 → API :8001         │
└───────────────────────┘         └───────────────────────┘
```

The frontend and backend each have their own dev and homolog environments, running side-by-side on the same machine, fully isolated via separate Docker Compose project names and ports.

---

## Project Structure

```
trampohub-frontend/
├── src/
│   ├── app/
│   │   ├── components/          # Standalone Angular components
│   │   ├── services/              # HTTP services (API communication)
│   │   ├── app.routes.ts           # Route definitions
│   │   └── app.config.ts            # Application-wide providers
│   └── environments/
│       ├── environment.ts             # Default (used as production fallback)
│       ├── environment.development.ts   # Used by `ng serve`
│       └── environment.homolog.ts         # Used by the Docker build for homolog
├── Dockerfile                              # Multi-stage build (Node → Nginx)
├── nginx.conf                                # SPA routing + static asset caching
├── docker-compose.homolog.yml                  # Homolog environment
├── Jenkinsfile                                   # CI/CD pipeline definition
├── angular.json                                    # Includes the custom "homolog" build configuration
├── package.json
└── package-lock.json
```

---

## Environments

Angular's `fileReplacements` mechanism swaps the `environment.ts` file at build time depending on the configuration used:

| Configuration | Command | Environment file used | API target |
|---|---|---|---|
| `development` (default for `ng serve`) | `ng serve` | `environment.development.ts` | `http://localhost:8000/api` |
| `homolog` | `ng build --configuration=homolog` | `environment.homolog.ts` | `http://localhost:8001/api` |
| `production` (default for `ng build`) | `ng build` | `environment.ts` | not used yet — no production environment exists |

> There is currently no "production" environment — only local development and a local homologation stack. The `production` Angular configuration exists because the CLI scaffolds it by default, but it isn't part of this project's actual deployment flow yet.

Example `environment.homolog.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001/api',
  serverUrl: 'http://localhost:8001',
};
```

---

## Getting Started

### Prerequisites

- Node.js 24.x
- npm 11.x
- Docker Desktop (Windows/WSL2)

### Local setup

```bash
git clone https://github.com/axandrade/trampohub-frontend.git
cd trampohub-frontend

npm ci
ng serve
```

The app will be available at `http://localhost:4200/`, consuming the backend API at `http://localhost:8000` (make sure `trampohub-api` is running in dev mode — see the backend's README).

---

## Running Tests

```bash
npx ng test --no-watch --no-progress --browsers=ChromeHeadlessNoSandbox --code-coverage
```

Tests run in a real headless Chrome instance (installed via `@puppeteer/browsers`, not the Debian `chromium` package — see [Troubleshooting](#troubleshooting) for why). Coverage reports are generated in `coverage/trampohub-frontend/`.

---

## Building for Homologation

```bash
npx ng build --configuration=homolog
```

This produces a static build in `dist/trampohub-frontend/browser`, wired to call the homolog backend API (`localhost:8001`).

To build and run the full containerized homolog stack:

```bash
docker build -t trampohub-frontend:homolog .
docker compose --project-name trampohub-frontend-homolog -f docker-compose.homolog.yml up -d
```

---

## CI/CD Pipeline

The Jenkins pipeline runs the following stages on every manual trigger:

1. **Checkout** — pulls the code from the configured Git branch.
2. **Tests** — runs inside an isolated `node:24-slim` Docker agent. Installs a standalone Chrome for Testing binary and runs the full Karma/Jasmine suite headlessly, with code coverage.
3. **SonarQube Analysis** — static analysis of TypeScript, HTML, and CSS, including coverage data via the generated `lcov.info` report.
4. **Build Docker Image** — multi-stage build: Angular is compiled with the `homolog` configuration in the first stage, then the static output is copied into a lightweight Nginx image.
5. **Deploy to Homolog** — tears down and recreates the homolog container with the freshly built image.

```groovy
// Simplified Jenkinsfile structure
pipeline {
    agent any
    stages {
        stage('Checkout') { ... }
        stage('Testes') {
            agent { docker { image 'node:24-slim' } }
            steps {
                sh 'npm ci'
                sh 'npx ng test --no-watch --browsers=ChromeHeadlessNoSandbox --code-coverage'
            }
        }
        stage('SonarQube Analysis') { ... }
        stage('Build da imagem Docker') {
            steps { sh 'docker build -t trampohub-frontend:homolog .' }
        }
        stage('Deploy Homologação') { ... }
    }
}
```

---

## Local Pipeline Infrastructure

This project shares the same Jenkins and SonarQube instances used by [trampohub-api](https://github.com/axandrade/trampohub-api) — both are provisioned once and reused across projects. See the backend's README for the full Jenkins/SonarQube/Docker Compose setup instructions.

The frontend Job in Jenkins reuses the same `github-token` credential already registered for the backend, since GitHub credentials aren't repository-specific.

---

## Troubleshooting

Non-obvious issues encountered while building this pipeline, kept here for future reference:

| Symptom | Root cause | Fix |
|---|---|---|
| Headless Chrome crashes with `Trace/breakpoint trap` | Debian's `chromium` apt package is incompatible with this base image | Install a standalone Chrome for Testing binary via `@puppeteer/browsers` instead of the OS package |
| `npm ci` fails with `Missing: @types/node@... from lock file` inside Docker | The Dockerfile's Node major version (22) didn't match the local dev environment (24), causing the lockfile to resolve differently | Align the Dockerfile's `node` image tag with the local Node version |
| CORS error: `No 'Access-Control-Allow-Origin' header is present` | The backend's `CORS_ALLOWED_ORIGINS` didn't include the frontend's homolog port | Add the exact `http://localhost:<port>` origin to the backend's CORS settings |
| `Error: Conflict. The container name ... is already in use` on deploy | A container was previously created manually with `docker run` using the same name the Compose stack expects | Remove the manually created container (`docker stop` + `docker rm`) before letting Compose manage it |
| Homolog frontend runs on an unexpected port (e.g. `4001` instead of `4201`) | Port mapping in `docker-compose.homolog.yml` didn't match what was documented/expected | Keep the port mapping and the CORS allow-list in sync; double-check both after any Compose file change |
| `[PrimeUI] PrimeUI license is not configured` warning in the console | Informational warning from PrimeNG's licensing notice for certain premium-adjacent components | Harmless for this project's usage; no action needed |

---

## Roadmap

- [ ] Integrate JWT-based authentication once the backend adopts it
- [ ] Add more comprehensive unit/component tests beyond the scaffolded defaults
- [ ] E2E tests (Playwright or Cypress)
- [ ] Reduce the "Zero Coverage" gap flagged by SonarQube by writing tests for critical components (job list, application form)
- [ ] Environment-aware API base URL resolution without rebuilding the image (e.g. runtime config injection)

---

## Related Repositories

- [trampohub-api](https://github.com/axandrade/trampohub-api) — Django REST backend

## Author

Built by [Alex Andrade](https://github.com/axandrade) as a personal full-stack learning project.
