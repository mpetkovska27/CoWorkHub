from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import connection
from .models import Reservation


@receiver(post_save, sender=Reservation)
def handle_reservation_save(sender, instance, created, **kwargs):
    if created:
        with connection.cursor() as cursor:
            if instance.contract_id is None:
                cursor.execute(
                    "CALL generate_single_invoice(%s, %s, %s)",
                    [instance.id, instance.setup_id, instance.responsible_member_id]
                )
            else:
                cursor.execute(
                    "CALL generate_contract_invoice(%s, %s, %s)",
                    [instance.id, instance.setup_id, instance.contract_id]
                )


@receiver(pre_save, sender=Reservation)
def handle_reservation_cancel(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = Reservation.objects.get(pk=instance.pk)
        if old.status != 'cancelled' and instance.status == 'cancelled':
            with connection.cursor() as cursor:
                cursor.execute(
                    "CALL cancel_reservation_invoice(%s, %s, %s)",
                    [instance.id, instance.invoice_id, instance.contract_id]
                )
    except Reservation.DoesNotExist:
        pass