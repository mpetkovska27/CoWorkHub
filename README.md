# CoWorkHub

A full-stack coworking space management system built with PostgreSQL, Django REST API, and React.

## Overview

CoWorkHub is a web application for managing coworking spaces — centers, workspaces, reservations, invoices, members and contracts. The system consists of three services: a PostgreSQL database, a Django backend API, and a React frontend.

```
React (port 80)  →  Django API (8000)  →  PostgreSQL (5432)
```

## Project Structure
```
CoWorkHub/
├── CoWorkHubProject/        # Django backend
│   ├── Coworkhub/
│   │   ├── models.py        # Database models
│   │   ├── api_views.py     # REST API endpoints
│   │   └── api_urls.py      # URL routing
│   ├── CoWorkHubProject/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # HomePage, ReservationsPage, InvoicesPage, ReportsPage
│   │   ├── api/             # axios.ts, mockData.ts
│   │   ├── styles/          # calendar.css
│   │   ├── App.tsx
│   │   └── App.css
│   ├── nginx.conf
│   └── Dockerfile
├── database/                # SQL scripts + custom PostgreSQL image
│   ├── queries/             # DDL, views, procedures, seed data
│   └── Dockerfile
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml.example
│   ├── argocd-app.yaml
│   ├── backend/
│   ├── frontend/
│   └── database/
├── .github/workflows/       # CI pipeline
│   └── ci.yaml
└── docker-compose.yaml
```

## Database

The database schema includes 14 tables: CoworkingCenter, Location, Workspace, WorkspaceSetup, Equipment, SetupEquipment, EquipmentComposition, Member, MemberEmail, Membership, MembershipPlan, Contract, Reservation, Invoice.

Indexes are defined on reservation date, responsible member, and membership member for faster queries.

**Stored Procedures:**
- `generate_single_invoice` — creates an invoice for a single reservation, applies membership discount if applicable
- `generate_contract_invoice` — creates or updates a shared invoice for contract-based reservations
- `cancel_reservation_invoice` — handles invoice refund or amount reduction on reservation cancellation

**SQL Views:**
- `view_invoice_ledger` — aggregates invoice totals by month and type (paid / unpaid / refunded)
- `center_occupancy` — shows booking counts and capacity usage per center per day

## Backend — Django

REST API built with `JsonResponse`. All endpoints are in `Coworkhub/api_views.py`:

| Endpoint | Description |
|---|---|
| `GET /api/stats/` | Dashboard stats |
| `GET /api/centers/` | Centers with workspaces |
| `GET/POST /api/reservations/` | List / Create reservations |
| `PATCH /api/reservations/{id}/cancel/` | Cancel a reservation |
| `GET /api/invoices/` | Invoice list |
| `PATCH /api/invoices/{id}/status/` | Update invoice status |
| `GET /api/reports/?period=today\|week` | Reports data |
| `GET /api/members/` | Members |
| `GET /api/setups/` | Workspace setups |
| `GET /api/contracts/` | Active contracts |

## Frontend — React

Single-page app with 4 pages:

- **Homepage** — live stats + coworking centers with expandable workspace cards
- **Reservations** — filterable table + calendar view with color-coded slots (morning / afternoon / evening)
- **Invoices** — invoice list with inline status change
- **Reports** — pie chart + bar chart with Today / This Week toggle

Built with TypeScript, CSS variables, and Axios for API communication.

## Docker

Each service has its own Dockerfile:
- `CoWorkHubProject/Dockerfile` — Django backend with Gunicorn
- `frontend/Dockerfile` — React app served via Nginx
- `database/Dockerfile` — Custom PostgreSQL image with init scripts (schema, procedures, views, seed data)

## Running with Docker Compose

```bash
docker compose up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

Admin credentials: `admin` / `admin`

## CI/CD — GitHub Actions

On every push to `main`, the pipeline:
1. Lints and checks the backend (Django system check)
2. Lints and builds the frontend
3. Runs backend tests against a real PostgreSQL instance
4. Builds and pushes all 3 Docker images to DockerHub:
   - `mpetkovska27/coworkhub-backend:latest`
   - `mpetkovska27/coworkhub-frontend:latest`
   - `mpetkovska27/coworkhub-db:latest`

## Kubernetes

Manifests are in `k8s/` and cover:
- **Namespace** — `coworkhub`
- **ConfigMap** — database connection and app settings
- **Secret** — database password and Django secret key
- **StatefulSet** — PostgreSQL with persistent volume
- **Deployments** — backend (3 replicas) and frontend (3 replicas) with rolling updates
- **Services** — ClusterIP for backend, frontend, and database
- **Ingress** — Nginx ingress routing `/` to frontend and `/api` to backend

### Deploy with ArgoCD

ArgoCD is used for GitOps-based continuous delivery. On every push to `main`, ArgoCD automatically syncs and deploys the latest manifests to the cluster.

```bash
minikube start --driver=docker

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply secrets (not stored in git)
kubectl apply -f k8s/secrets.yaml

# Deploy via ArgoCD
kubectl apply -f k8s/argocd-app.yaml

# Open ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# https://localhost:8080  —  user: admin
```

Open the app:
```bash
minikube service frontend -n coworkhub
```
