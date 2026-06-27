from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
import uuid
from datetime import date
from .models import CoworkingCenter, Workspace, Reservation, Invoice, Member, WorkspaceSetup, Contract


def health_check(request):
    return JsonResponse({"status": "ok"})

# 1. GET /api/stats/
def get_stats(request):
    today = date.today()
    active_reservations = Reservation.objects.filter(
        date=today,
        status__in=['pending', 'confirmed']
    ).count()
    free_workspaces = Workspace.objects.filter(
        status='available'
    ).count()

    unpaid_invoices = Invoice.objects.filter(
        status='unpaid'
    ).count()

    return JsonResponse({
        'active_reservations': active_reservations,
        'free_workspaces': free_workspaces,
        'unpaid_invoices': unpaid_invoices,
    })

#2 GET /api/centers
def get_centers_and_workspaces(request):
    centers = CoworkingCenter.objects.all()
    data = []
    for center in centers:
        workspaces = list(center.workspaces.values('id', 'name', 'type', 'capacity', 'status'))
        data.append({
            'id': center.id,
            'name': center.name,
            'contact_phone': center.contact_phone,
            'workspaces': workspaces,
        })
    return JsonResponse(data, safe=False)

# 3. GET & POST /api/reservations/
@csrf_exempt
def reservations_api(request):
    if request.method == 'GET':
        reservations = list(Reservation.objects.values(
            'id', 'date', 'slot', 'status', 'code',
            'responsible_member__first_name', 'responsible_member__last_name',
            'contract_id', 'invoice_id'
        ))
        return JsonResponse({'reservations': reservations})

    elif request.method == 'POST':
        data = json.loads(request.body)
        code = 'RES-' + uuid.uuid4().hex[:8].upper()
        res = Reservation.objects.create(
            responsible_member_id=data['responsible_member_id'],
            setup_id=data['setup_id'],
            date=data['date'],
            slot=data['slot'],
            contract_id=data.get('contract_id'),
            code=code,
            status='pending',
        )
        return JsonResponse({'status': 'success', 'id': res.id, 'code': code}, status=201)

# 4. PATCH /api/reservations/{id}/cancel/
@csrf_exempt
def reservation_cancel(request, pk):
    reservation = Reservation.objects.get(id=pk)
    reservation.status = 'cancelled'
    reservation.save()
    return JsonResponse({'status': 'cancelled'})

#5. GET /api/invoices/
def invoices_list(request):
    invoices = list(Invoice.objects.values(
        'id', 'issue_date', 'total_amount', 'tax_amount', 'status', 'type'
    ))
    for inv in invoices:
        inv['total_amount'] = float(inv['total_amount'])
        inv['tax_amount'] = float(inv['tax_amount'])
    return JsonResponse({'invoices': invoices})

#6. GET /api/reports/
def reports_api(request):
    period = request.GET.get('period', 'today')

    if period == 'week':
        occupancy_query = """
            SELECT * FROM center_occupancy
            WHERE reservation_date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY reservation_date DESC
        """
    else:
        occupancy_query = """
            SELECT * FROM center_occupancy
            WHERE reservation_date = CURRENT_DATE
        """

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM view_invoice_ledger")
        ledger_cols = [col[0] for col in cursor.description]
        ledger_rows = [dict(zip(ledger_cols, row)) for row in cursor.fetchall()]

        cursor.execute(occupancy_query)
        occ_cols = [col[0] for col in cursor.description]
        occ_rows = [dict(zip(occ_cols, row)) for row in cursor.fetchall()]

    return JsonResponse({'invoice_ledger': ledger_rows, 'center_occupancy': occ_rows})

# 6b. PATCH /api/invoices/{id}/status/
@csrf_exempt
def invoice_update_status(request, pk):
    if request.method != 'PATCH':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        body = json.loads(request.body)
        invoice = Invoice.objects.get(id=pk)
        invoice.status = body['status']
        invoice.save()
        return JsonResponse({'id': invoice.id, 'status': invoice.status})
    except Invoice.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

#helpers
def members_list(request):
    members = list(Member.objects.values('id', 'first_name', 'last_name'))
    return JsonResponse({'members': members})

def setups_list(request):
    setups = list(WorkspaceSetup.objects.values('id', 'version_number', 'workspace_id', 'price_per_slot'))
    return JsonResponse({'setups': setups})

def contracts_list(request):
    contracts = list(Contract.objects.filter(status='active').values('id', 'member_id', 'start_date', 'end_date'))
    return JsonResponse({'contracts': contracts})
