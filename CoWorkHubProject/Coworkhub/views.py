from django.shortcuts import render
from django.db import connection
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