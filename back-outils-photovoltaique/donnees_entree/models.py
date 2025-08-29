from django.db import models

class DonneesEntree(models.Model):
    e_jour = models.FloatField()  # Consommation journalière
    p_max = models.FloatField()   # Puissance maximum
    n_autonomie = models.FloatField()  # Nombre de jours d'autonomie
    localisation = models.CharField(max_length=255, db_index=True)
    v_batterie = models.FloatField()  # Tension batterie
    h_solaire = models.FloatField(null=True, blank=True) 
    h_vers_toit = models.FloatField(null=True, blank=True)
    
    
    
    
    
    
    PRIORITE_CHOICES = [
        ('cout', 'Prioriser le coût minimal'),
        ('quantite', 'Prioriser le nombre minimal'),
    ]
    priorite_selection = models.CharField(
        max_length=10,
        choices=PRIORITE_CHOICES,
        default='cout',
        null=True, blank=True,  # laisse la compatibilité pour l'existant
    )
    
    
    
    
    
    
    class Meta:
        indexes = [
            models.Index(fields=['localisation']),
        ]
    
    def __str__(self):
        return f"Données {self.id} - {self.localisation}"