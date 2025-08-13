from django.db import models

class DonneesEntree(models.Model):
    e_jour = models.FloatField()  # Consommation journalière
    p_max = models.FloatField()   # Puissance maximum
    n_autonomie = models.FloatField()  # Nombre de jours d'autonomie
    localisation = models.CharField(max_length=255, db_index=True)
    v_batterie = models.FloatField()  # Tension batterie

    class Meta:
        indexes = [
            models.Index(fields=['localisation']),
        ]
    
    def __str__(self):
        return f"Données {self.id} - {self.localisation}"