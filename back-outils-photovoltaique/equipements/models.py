from django.db import models

class Equipement(models.Model):
    TYPE_CHOICES = [
        ('Panneau solaire', 'Panneau solaire'),
        ('Batterie', 'Batterie'),
        ('Onduleur', 'Onduleur'),
        ('Régulateur', 'Régulateur'),
        # Ajoutez d'autres types si nécessaire
    ]
    
    CATEGORIE_CHOICES = [
        ('Général', 'Général'),
        ('Spécial', 'Spécial'),
        ('Autre', 'Autre'),
        # Ajoutez d'autres catégories si nécessaire
    ]
    
    type_equipement = models.CharField(max_length=50, choices=TYPE_CHOICES, db_index=True)
    nom = models.CharField(max_length=100, blank=True, null=True)  # Rendre ce champ optionnel
    modele = models.CharField(max_length=100, default='Standard', db_index=True)  # Indexation pour recherches fréquentes
    categorie = models.CharField(max_length=50, choices=CATEGORIE_CHOICES, default='Général', db_index=True)
    puissance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, db_index=True)
    capacite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, db_index=True)
    tension = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, db_index=True)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        # Logique simplifiée pour __str__
        return f"{self.type_equipement} - {self.modele or self.nom or 'N/A'}"

    class Meta:
        verbose_name_plural = "Equipements"
        indexes = [
            models.Index(fields=['type_equipement', 'modele']),  # Indexation sur les champs fréquemment utilisés pour les filtres
            models.Index(fields=['categorie', 'prix_unitaire']),  # Index composite pour les filtres
        ]