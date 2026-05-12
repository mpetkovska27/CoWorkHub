from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from django.urls import reverse

from .models import *
# Register your models here.

class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    fields = ('plan', 'start_date', 'end_date', 'status')
    autocomplete_fields = ('plan',)
    ordering = ('-start_date',)
    show_change_link = True

class WorkspaceInline(admin.TabularInline):
    model = Workspace
    extra = 0
    fields = ('name', 'type', 'capacity', 'status')
    show_change_link = True

class WorkspaceSetupInline(admin.TabularInline):
    model = WorkspaceSetup
    extra = 0
    fields = ('version_number', 'valid_from', 'price_per_slot', 'description')
    show_change_link = True

class SetupEquipmentInline(admin.TabularInline):
    model = SetupEquipment
    extra = 0
    fields = ('equipment', 'quantity')

class ReservationParticipantsInline(admin.TabularInline):
    model = ReservationParticipants
    extra = 0
    fields = ('member',)

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'active_membership')
    search_fields = ('first_name', 'last_name')
    inlines = [MembershipInline]

    def active_membership(self, obj):
        membership = obj.memberships.filter(status='active').first()
        if membership and membership.plan:
            return membership.plan.type
        return '—'

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'price', 'discount_percentage')
    list_filter = ('type',)
    search_fields = ('type',)

@admin.register(CoworkingCenter)
class CoworkingCenterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'location', 'contact_phone', 'email')
    search_fields = ('name', 'email')
    list_filter = ('location__city',)
    inlines = [WorkspaceInline]

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'address', 'city')
    search_fields = ('name', 'city')

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'capacity', 'status', 'coworking_center',)
    list_filter = ('status', 'type', 'coworking_center')
    search_fields = ('name', 'coworking_center__name')
    autocomplete_fields = ('coworking_center',)
    inlines = [WorkspaceSetupInline]
    ordering = ('coworking_center', 'name')

@admin.register(WorkspaceSetup)
class WorkspaceSetupAdmin(admin.ModelAdmin):
    list_display = ('id', 'workspace', 'version_number', 'valid_from', 'price_per_slot')
    list_filter = ('workspace__coworking_center',)
    search_fields = ('workspace__name',)
    inlines = [SetupEquipmentInline]

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type')
    search_fields = ('name', 'type')

@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'status', 'start_date', 'end_date', 'fixed_price', 'reservation_count',)
    list_filter = ('status', 'start_date')
    search_fields = ('member__first_name', 'member__last_name')
    autocomplete_fields = ('member',)
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(_reservation_count=Count('reservations', distinct=True))
        )

    @admin.display(description='Reservations', ordering='_reservation_count')
    def reservation_count(self, obj):
        return obj._reservation_count

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'issue_date', 'total_amount', 'tax_amount', 'status', 'type',)
    list_filter = ('status', 'type', 'issue_date')
    date_hierarchy = 'issue_date'
    ordering = ('-issue_date',)
    readonly_fields = ('issue_date', 'total_amount', 'tax_amount', 'type')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'date', 'slot', 'status', 'responsible_member', 'workspace_name', 'invoice_link', 'contract')
    list_filter = ('status', 'slot')
    exclude = ('invoice',)
    search_fields = ('code', 'responsible_member__first_name', 'responsible_member__last_name')
    date_hierarchy = 'date'
    readonly_fields = ('invoice_link',)
    autocomplete_fields = ('responsible_member', 'setup', 'contract',)
    inlines = [ReservationParticipantsInline]

    @admin.display(
        description='Workspace',
        ordering='setup__workspace__name',
    )
    def workspace_name(self, obj):
        return obj.setup.workspace.name if obj.setup_id else None

    def invoice_link(self, obj):
        if not obj.invoice_id:
            return '—'
        url = reverse('admin:Coworkhub_invoice_change', args=[obj.invoice_id])
        return format_html('<a href="{}">Invoice #{}</a>', url, obj.invoice_id)

    invoice_link.short_description = 'Invoice'