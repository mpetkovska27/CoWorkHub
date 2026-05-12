from django.shortcuts import render, redirect
from django.db import connection
from django.contrib import messages
from .forms import ReservationForm
import uuid

from .models import Reservation


# Create your views here.

def reports(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM view_invoice_ledger")
        ledger_cols = [col[0] for col in cursor.description]
        ledger_rows = cursor.fetchall()

        cursor.execute("SELECT * FROM center_occupancy")
        occupancy_cols = [col[0] for col in cursor.description]
        raw_rows = cursor.fetchall()

    cap_used_idx = occupancy_cols.index('total_capacity_used')
    cap_total_idx = occupancy_cols.index('total_capacity')

    occupancy_rows = [
        {
            'values': row,
            'over_capacity': row[cap_used_idx] > row[cap_total_idx]
        }
        for row in raw_rows
    ]

    return render(request, 'reports.html', {
        'ledger_cols': ledger_cols,
        'ledger_rows': ledger_rows,
        'occupancy_cols': occupancy_cols,
        'occupancy_rows': occupancy_rows,
    })

def reserve(request):
    if request.method == 'POST':
        form = ReservationForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            code = 'RES-' + uuid.uuid4().hex[:8].upper()
            Reservation.objects.create(
                responsible_member=data['responsible_member'],
                setup=data['setup'],
                date=data['date'],
                slot=data['slot'],
                contract=data['contract'],
                code=code,
                status='pending',
            )
            messages.success(request, f'Reservation {code} created successfully.')
            return redirect('reserve')
    else:
        form = ReservationForm()

    return render(request, 'reserve.html', {'form': form})