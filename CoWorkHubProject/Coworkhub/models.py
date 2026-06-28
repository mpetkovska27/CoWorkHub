from datetime import date
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    class Meta:
        managed = True
        db_table = 'location'

    def __str__(self):
        return self.name or f"{self.address}, {self.city}"

class Equipment(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'equipment'

    def __str__(self):
        return self.name

class Member(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'member'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class MembershipPlan(models.Model):
    type = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        default=0, blank=True, null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    class Meta:
        managed = True
        db_table = 'membershipplan'
        constraints = [
            models.CheckConstraint(
                condition=(models.Q(discount_percentage__gte=0) & models.Q(discount_percentage__lte=100)),
                name='membershipplan_discount_range',
            ),
        ]

    def __str__(self):
        return f"{self.type} - {self.price}"

class Invoice(models.Model):
    STATUS_CHOICES = [('paid', 'Paid'), ('unpaid', 'Unpaid'), ('refunded', 'Refunded')]
    TYPE_CHOICES = [('single', 'Single'), ('contract', 'Contract')]

    issue_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='unpaid', choices=STATUS_CHOICES)
    type = models.CharField(max_length=50, blank=True, null=True, choices=TYPE_CHOICES)

    class Meta:
        managed = True
        db_table = 'invoice'
        constraints = [
            models.CheckConstraint(condition=models.Q(total_amount__gte=0), name='invoice_total_amount_nonneg'),
        ]

    def __str__(self):
        return f"Invoice #{self.id} - {self.total_amount}"

class CoworkingCenter(models.Model):
    name = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT, db_column='location_id')

    class Meta:
        managed = True
        db_table = 'coworkingcenter'

    def __str__(self):
        return self.name

class Workspace(models.Model):
    STATUS_CHOICES = [('available', 'Available'), ('occupied', 'Occupied'), ('maintenance', 'Maintenance')]
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, default='available', choices=STATUS_CHOICES)
    coworking_center = models.ForeignKey(CoworkingCenter, on_delete=models.CASCADE, db_column='coworking_center_id', related_name='workspaces')

    class Meta:
        managed = True
        db_table = 'workspace'

class WorkspaceSetup(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, db_column='workspace_id', related_name='setups')
    version_number = models.IntegerField(validators=[MinValueValidator(1)])
    valid_from = models.DateField(default=date.today, blank=True, null=True)
    price_per_slot = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'workspacesetup'
        constraints = [
            models.UniqueConstraint(fields=['workspace', 'version_number'], name='uniq_workspace_version'),
        ]

    def __str__(self):
        return f"{self.workspace.name} v{self.version_number}"

class Contract(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive'), ('terminated', 'Terminated')]
    fixed_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, default='active', choices=STATUS_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    member = models.ForeignKey(Member, on_delete=models.PROTECT, db_column='member_id')

    class Meta:
        managed = True
        db_table = 'contract'

class Reservation(models.Model):
    SLOT_CHOICES = [('morning', 'Morning'), ('afternoon', 'Afternoon'), ('evening', 'Evening')]
    STATUS_CHOICES = [('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')]

    date = models.DateField()
    slot = models.CharField(max_length=20, choices=SLOT_CHOICES)
    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)
    code = models.CharField(max_length=20, unique=True)
    responsible_member = models.ForeignKey(Member, on_delete=models.PROTECT, db_column='responsible_member_id', related_name='responsible_reservations')
    setup = models.ForeignKey(WorkspaceSetup, on_delete=models.PROTECT, db_column='setup_id')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, db_column='invoice_id', blank=True, null=True)
    contract = models.ForeignKey(Contract, on_delete=models.SET_NULL, db_column='contract_id', blank=True, null=True, related_name='reservations')

    class Meta:
        managed = True
        db_table = 'reservation'
        constraints = [
            models.UniqueConstraint(fields=['setup', 'date', 'slot'], name='uniq_res_setup_date_slot'),
        ]

class SetupEquipment(models.Model):
    setup = models.ForeignKey(WorkspaceSetup, on_delete=models.CASCADE, db_column='setup_id')
    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, db_column='equipment_id')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        managed = True
        db_table = 'setupequipment'
        constraints = [
            models.UniqueConstraint(fields=['setup', 'equipment'], name='uniq_setup_equipment'),
        ]

class EquipmentComposition(models.Model):
    parent_equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, db_column='parent_equipment_id', related_name='children')
    child_equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, db_column='child_equipment_id', related_name='parents')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        managed = True
        db_table = 'equipmentcomposition'
        constraints = [
            models.UniqueConstraint(fields=['parent_equipment', 'child_equipment'], name='uniq_equip_comp'),
        ]

class ReservationParticipants(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, db_column='reservation_id', primary_key=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, db_column='member_id')

    class Meta:
        managed = False
        db_table = 'reservationparticipants'
        unique_together = [('reservation', 'member')]

class Membership(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('inactive', 'Inactive')]
    member = models.ForeignKey(Member, on_delete=models.CASCADE, db_column='member_id', related_name='memberships')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT, db_column='plan_id', blank=True, null=True)
    start_date = models.DateField(default=date.today)
    end_date = models.DateField()
    status = models.CharField(max_length=20, default='active', choices=STATUS_CHOICES)

    class Meta:
        managed = True
        db_table = 'membership'

class MemberEmail(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, db_column='member_id')
    email = models.EmailField(max_length=100, unique=True)

    class Meta:
        managed = True
        db_table = 'memberemail'
        constraints = [
            models.UniqueConstraint(fields=['member', 'email'], name='uniq_member_email'),
        ]