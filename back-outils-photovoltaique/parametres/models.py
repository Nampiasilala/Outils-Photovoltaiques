from django.db import models
from users.models import User

class ParametreSysteme(models.Model):
    n_global = models.FloatField()
    k_securite = models.FloatField()
    dod = models.FloatField()
    k_dimensionnement = models.FloatField()
    h_solaire = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parametres_systeme')  # Ajout du related_name pour une gestion inverse efficace

    def __str__(self):
        # Affichage plus lisible de l'objet
        return f"Paramètre {self.id} - Utilisateur: {self.user.username if self.user else 'N/A'}"

    class Meta:
        indexes = [
            models.Index(fields=['user']),  # Indexation sur 'user' pour améliorer la recherche des paramètres de l'utilisateur
        ]
