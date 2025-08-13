from django.contrib import admin
from .models import Dimensionnement

@admin.register(Dimensionnement)
class DimensionnementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_localisation',
        'date_calcul',
        'puissance_totale',
        'capacite_batterie',
        'nombre_panneaux',
        'nombre_batteries',
        'cout_total',
        'get_equipements_status'
    )
    
    list_filter = (
        'date_calcul',
        'entree__localisation',
        'entree__v_batterie',
        'nombre_panneaux',
        'nombre_batteries'
    )
    
    search_fields = (
        'entree__localisation',
    )
    
    readonly_fields = (
        'id', 
        'date_calcul',
        'puissance_totale',
        'capacite_batterie', 
        'bilan_energetique_annuel',
        'cout_total'
    )
    
    ordering = ('-date_calcul',)
    
    # Relations pour optimiser les requêtes
    list_select_related = ('entree', 'parametre')
    
    # Organisation en sections
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'date_calcul', 'entree', 'parametre')
        }),
        ('Résultats de calcul', {
            'fields': (
                'puissance_totale', 
                'capacite_batterie', 
                'nombre_panneaux', 
                'nombre_batteries',
                'bilan_energetique_annuel',
                'cout_total'
            )
        }),
        ('Équipements recommandés', {
            'fields': (
                'panneau_recommande',
                'batterie_recommandee', 
                'regulateur_recommande',
                'onduleur_recommande',
                'cable_recommande'
            )
        }),
    )
    
    def get_localisation(self, obj):
        """Affiche la localisation depuis les données d'entrée"""
        return obj.entree.localisation
    get_localisation.short_description = 'Localisation'
    get_localisation.admin_order_field = 'entree__localisation'
    
    def get_equipements_status(self, obj):
        """Affiche le statut des équipements recommandés"""
        equipements = []
        if obj.panneau_recommande:
            equipements.append('P')
        if obj.batterie_recommandee:
            equipements.append('B')
        if obj.regulateur_recommande:
            equipements.append('R')
        if obj.onduleur_recommande:
            equipements.append('O')
        if obj.cable_recommande:
            equipements.append('C')
        
        return '/'.join(equipements) if equipements else 'Aucun'
    get_equipements_status.short_description = 'Équipements'
    
    # Actions personnalisées
    actions = ['recalculer_couts']
    
    def recalculer_couts(self, request, queryset):
        """Recalcule les coûts pour les dimensionnements sélectionnés"""
        updated = 0
        for dimensionnement in queryset:
            old_cout = dimensionnement.cout_total
            dimensionnement.cout_total = dimensionnement.calculer_cout_total()
            dimensionnement.save()
            updated += 1
        
        self.message_user(
            request, 
            f'{updated} dimensionnement(s) recalculé(s) avec succès.'
        )
    recalculer_couts.short_description = 'Recalculer les coûts sélectionnés'