from django import forms
from .models import Reservation, WorkspaceSetup, Member, Contract
from datetime import date


class ReservationForm(forms.Form):
    responsible_member = forms.ModelChoiceField(
        queryset=Member.objects.all(),
        label='Member',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    setup = forms.ModelChoiceField(
        queryset=WorkspaceSetup.objects.select_related('workspace').all(),
        label='Workspace Setup',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    date = forms.DateField(
        label='Date',
        initial=date.today,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    slot = forms.ChoiceField(
        choices=Reservation.SLOT_CHOICES,
        label='Slot',
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    contract = forms.ModelChoiceField(
        queryset=Contract.objects.filter(status='active'),
        label='Contract (optional)',
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    def clean(self):
        cleaned_data = super().clean()
        setup = cleaned_data.get('setup')
        date = cleaned_data.get('date')
        slot = cleaned_data.get('slot')

        if setup and date and slot:
            already_booked = Reservation.objects.filter(
                setup=setup,
                date=date,
                slot=slot
            ).exists()
            if already_booked:
                raise forms.ValidationError(
                    f'This slot is already booked. Please choose a different date or slot.'
                )
        return cleaned_data