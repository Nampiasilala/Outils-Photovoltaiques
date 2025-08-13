from django.contrib import admin
from .models import Equipement

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'reference',
        'categorie',  # choix (ex: Panneau solaire, Batterie, etc.)
        'get_nom_complet',
        'marque',
        'puissance_W',
        'capacite_Ah',
        'tension_nominale_V',
        'prix_unitaire',
        'devise',
        'disponible'
    )
    
    list_filter = (
        'categorie', 
        'devise', 
        'disponible',
        'marque',
        'type_regulateur'
    )
    
    search_fields = (
        'reference', 
        'modele', 
        'nom_commercial', 
        'marque'
    )
    
    readonly_fields = ('id',)
    
    ordering = ('categorie', 'marque', 'reference')
    
    # Organisation simplifiée par sections principales
    fieldsets = (
        ('Informations générales', {
            'fields': (
                'id',
                'reference', 
                'categorie',
                'marque', 
                'modele', 
                'nom_commercial',
                'disponible'
            )
        }),
        ('Prix', {
            'fields': ('prix_unitaire', 'devise')
        }),
        ('Caractéristiques principales', {
            'fields': (
                'puissance_W',
                'capacite_Ah', 
                'tension_nominale_V',
                'courant_A'
            )
        }),
        ('Caractéristiques spécifiques', {
            'fields': (
                'vmp_V', 'voc_V',  # Panneau
                'type_regulateur', 'pv_voc_max_V', 'mppt_v_min_V', 'mppt_v_max_V',  # Régulateur
                'puissance_surgeb_W', 'entree_dc_V', 'sortie_ac_V', 'frequence_Hz',  # Onduleur
                'section_mm2', 'ampacite_A'  # Câble
            ),
            'classes': ('collapse',)
        }),
        ('Informations supplémentaires', {
            'fields': ('datasheet_url', 'meta'),
            'classes': ('collapse',)
        }),
    )
    
    def get_nom_complet(self, obj):
        """Affiche le nom complet de l'équipement"""
        return obj.nom_commercial or obj.modele or f"{obj.marque} {obj.reference}"
    get_nom_complet.short_description = 'Nom complet'
    get_nom_complet.admin_order_field = 'nom_commercial'
    
    # Actions utiles
    actions = ['marquer_disponible', 'marquer_indisponible']
    
    def marquer_disponible(self, request, queryset):
        updated = queryset.update(disponible=True)
        self.message_user(
            request,
            f'{updated} équipement(s) marqué(s) comme disponible(s).'
        )
    marquer_disponible.short_description = 'Marquer comme disponible'
    
    def marquer_indisponible(self, request, queryset):
        updated = queryset.update(disponible=False)
        self.message_user(
            request,
            f'{updated} équipement(s) marqué(s) comme indisponible(s).'
        )
    marquer_indisponible.short_description = 'Marquer comme indisponible'