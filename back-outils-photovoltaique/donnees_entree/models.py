from django.db import models
from users.models import User

class DonneesEntree(models.Model):
    e_jour = models.FloatField()
    p_max = models.FloatField()
    n_autonomie = models.FloatField()
    localisation = models.CharField(max_length=255, db_index=True)  # Indexation sur 'localisation' pour accélérer les recherches
    v_batterie = models.FloatField()
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="donnees_entree",  # Optimise les requêtes inverses en facilitant l'accès aux données de l'utilisateur
        db_index=True  # Indexation sur 'user' pour des recherches plus rapides
    )

    class Meta:
        indexes = [
            models.Index(fields=['user', 'localisation']),  # Index composite pour optimiser les filtres sur user et localisation
        ]
    
    def __str__(self):
        return f"DonneesEntree {self.id} pour {self.user}"
