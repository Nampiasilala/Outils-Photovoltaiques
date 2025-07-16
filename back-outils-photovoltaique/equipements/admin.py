from django.contrib import admin
from .models import Equipement

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display  = ('type_equipement', 'categorie', 'puissance', 'tension', 'capacite', 'prix_unitaire')
    list_filter   = ('categorie',)
    search_fields = ('type_equipement',)
