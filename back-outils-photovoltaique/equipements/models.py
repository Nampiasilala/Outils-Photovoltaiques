from django.db import models

class Equipement(models.Model):
    type_equipement = models.CharField(max_length=255)
    categorie = models.CharField(max_length=255, default="Non spécifié")
    puissance = models.FloatField()
    tension = models.FloatField()
    capacite = models.FloatField()
    prix_unitaire = models.FloatField()
    
    def __str__(self):
        return self.type_equipement