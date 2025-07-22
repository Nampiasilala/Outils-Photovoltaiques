# equipements/models.py

from django.db import models

class Equipement(models.Model):
    TYPE_CHOICES = [
        ('Panneau solaire', 'Panneau solaire'),
        ('Batterie', 'Batterie'),
        ('Onduleur', 'Onduleur'),
        ('Régulateur', 'Régulateur'),
        # Ajoutez d'autres types si nécessaire
    ]
    type_equipement = models.CharField(max_length=50, choices=TYPE_CHOICES)
    nom = models.CharField(max_length=100, blank=True, null=True) # <-- C'EST PEUT-ÊTRE CE CHAMP QUE VOUS CHERCHEZ
    modele = models.CharField(max_length=100, default='Standard') # <-- AJOUTEZ CE CHAMP
    categorie = models.CharField(max_length=50, default='Général') # Ou choices=... ou blank=True, null=True
    puissance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    capacite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tension = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        # Afficher le modèle ou le nom si existant, sinon le type
        return f"{self.type_equipement} - {self.modele if self.modele else self.nom if self.nom else 'N/A'}"

    class Meta:
        verbose_name_plural = "Equipements"