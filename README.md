# CoWorkHub

A coworking space management system built with PostgreSQL, Django and React.

## About

CoWorkHub handles coworking center operations — reservations, invoices, members and contracts. It runs as three services: a PostgreSQL database, a Django REST backend, and a React frontend.

```
React (5173)  →  Django API (8000)  →  PostgreSQL (5432)
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

REST API built with plain `JsonResponse` (no DRF serializers). All endpoints are in `Coworkhub/api_views.py`.

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

```bash
# Backend
cd CoWorkHubProject
pip install -r requirements.txt
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```
