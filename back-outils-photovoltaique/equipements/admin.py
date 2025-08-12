# equipements/admin.py
from django.contrib import admin
from .models import Equipement

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'reference',
        'categorie',            # choix (ex: Panneau solaire, Batterie, etc.)
        'modele',
        'puissance_W',
        'capacite_Ah',
        'tension_nominale_V',
        'prix_unitaire',
        'devise',
    )
    list_filter = ('categorie', 'devise', 'disponible')
    search_fields = ('reference', 'modele', 'nom_commercial', 'marque')
