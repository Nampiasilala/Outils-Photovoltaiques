from django.db import models
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from equipements.models import Equipement # <-- N'oubliez pas d'importer le modèle Equipement

class Dimensionnement(models.Model):
    date_calcul = models.DateField(auto_now_add=True)
    puissance_totale = models.FloatField()
    capacite_batterie = models.FloatField()
    nombre_panneaux = models.IntegerField()
    nombre_batteries = models.IntegerField(default=0) # <-- Assurez-vous d'avoir ce champ pour le nombre de batteries
    bilan_energetique_annuel = models.FloatField()
    cout_total = models.FloatField()
    entree = models.ForeignKey(DonneesEntree, on_delete=models.CASCADE)
    parametre = models.ForeignKey(ParametreSysteme, on_delete=models.CASCADE)

    # NOUVEAUX CHAMPS : Références aux équipements choisis
    panneau_recommande = models.ForeignKey(
        Equipement,
        on_delete=models.SET_NULL, # Si le panneau est supprimé, la référence devient NULL
        null=True,
        blank=True,
        related_name='dimensionnements_panneau' # Nom pour la relation inverse
    )
    batterie_recommandee = models.ForeignKey(
        Equipement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dimensionnements_batterie'
    )
    regulateur_recommande = models.ForeignKey(
        Equipement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dimensionnements_regulateur'
    )

    def __str__(self):
        return f"Dimensionnement {self.id} - {self.date_calcul}"

