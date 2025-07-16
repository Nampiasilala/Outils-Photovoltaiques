from django.contrib import admin
from .models import DonneesEntree

@admin.register(DonneesEntree)
class DonneesEntreeAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'e_jour',
        'p_max',
        'n_autonomie',
        'localisation',
        'v_batterie',
    )
    list_filter = (
        'user',
        'localisation',
    )
    search_fields = (
        'user__email',
        'localisation',
    )
