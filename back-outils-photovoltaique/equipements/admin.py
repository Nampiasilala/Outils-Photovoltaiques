# equipements/admin.py
from django.contrib import admin
from .models import Equipement

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('id', 'type_equipement', 'modele', 'puissance', 'capacite', 'tension', 'prix_unitaire') # <-- AJOUTEZ 'modele' ici
    list_filter = ('type_equipement',)
    search_fields = ('modele', 'type_equipement')