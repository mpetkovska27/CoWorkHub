from django.urls import path
from . import api_views

urlpatterns = [
    path('stats/', api_views.stats),
    path('centers/', api_views.centers_list),
    path('reservations/', api_views.reservations_api),
    path('reservations/<int:pk>/cancel/', api_views.reservation_cancel),
    path('invoices/', api_views.invoices_list),
    path('reports/', api_views.reports_api),
    path('members/', api_views.members_list),
    path('setups/', api_views.setups_list),
    path('contracts/', api_views.contracts_list),
]