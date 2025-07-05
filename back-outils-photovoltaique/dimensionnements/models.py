from django.db import models
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme

class Dimensionnement(models.Model):
    date_calcul = models.DateField(auto_now_add=True)
    puissance_totale = models.FloatField()
    capacite_batterie = models.FloatField()
    nombre_panneaux = models.IntegerField()
    bilan_energetique_annuel = models.FloatField()
    cout_total = models.FloatField()
    entree = models.ForeignKey(DonneesEntree, on_delete=models.CASCADE)
    parametre = models.ForeignKey(ParametreSysteme, on_delete=models.CASCADE)

    def __str__(self):
        return f"Dimensionnement {self.id}"
