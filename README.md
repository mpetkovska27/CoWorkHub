# CoWorkHub

A full-stack coworking space management system built with PostgreSQL, Django REST API, and React.

## Overview

CoWorkHub is a web application for managing coworking spaces — centers, workspaces, reservations, invoices, members and contracts. The system consists of three services: a PostgreSQL database, a Django backend API, and a React frontend.

```
React (5173)  →  Django API (8000)  →  PostgreSQL (5432)
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
│   └── requirements.txt
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/           # HomePage,            ReservationsPage, InvoicesPage, ReportsPage
│   │   ├── api/             # axios.ts, mockData.ts
│   │   ├── styles/          # calendar.css
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── database/                # SQL scripts (DDL, views, triggers, reports)
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

## Integration

Frontend communicates with the backend via Axios (`baseURL: http://127.0.0.1:8000/api`). CORS is configured in Django to allow `localhost:5173`.

## Running Locally

**Backend:**
```bash
cd CoWorkHubProject
pip install -r requirements.txt
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)