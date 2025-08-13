from django.contrib import admin
from .models import DonneesEntree

@admin.register(DonneesEntree)
class DonneesEntreeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'localisation',
        'e_jour',
        'p_max',
        'n_autonomie', 
        'v_batterie',
        'get_dimensionnements_count'
    )
    
    list_filter = (
        'localisation',
        'v_batterie'
    )
    
    search_fields = (
        'localisation',
    )
    
    readonly_fields = ('id',)
    
    ordering = ('-id',)
    
    # Champs regroupés pour une meilleure organisation
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'localisation')
        }),
        ('Paramètres électriques', {
            'fields': ('e_jour', 'p_max', 'n_autonomie', 'v_batterie')
        }),
    )
    
    def get_dimensionnements_count(self, obj):
        """Affiche le nombre de dimensionnements créés avec ces données"""
        return obj.dimensionnement_set.count()
    get_dimensionnements_count.short_description = 'Nb Dimensionnements'
    get_dimensionnements_count.admin_order_field = 'dimensionnement_count'
    
    def get_queryset(self, request):
        """Optimise les requêtes en comptant les dimensionnements"""
        qs = super().get_queryset(request)
        return qs.prefetch_related('dimensionnement_set')