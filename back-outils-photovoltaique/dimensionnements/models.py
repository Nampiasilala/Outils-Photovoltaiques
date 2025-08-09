from django.db import models
from django.conf import settings
from equipements.models import Equipement
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from django.core.cache import cache

class Dimensionnement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date_calcul = models.DateTimeField(auto_now_add=True)  # Date de calcul
    puissance_totale = models.FloatField()
    capacite_batterie = models.FloatField()
    nombre_panneaux = models.IntegerField()
    nombre_batteries = models.IntegerField(default=0)  # Nombre de batteries
    bilan_energetique_annuel = models.FloatField()
    cout_total = models.FloatField()
    entree = models.ForeignKey(DonneesEntree, on_delete=models.CASCADE)
    parametre = models.ForeignKey(ParametreSysteme, on_delete=models.CASCADE)

    # Champs supplémentaires pour référencer les équipements recommandés
    panneau_recommande = models.ForeignKey(
        Equipement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dimensionnements_panneau'
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
    
    onduleur_recommande = models.ForeignKey(  # ✅ Ajouter l'onduleur
        Equipement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dimensionnements_onduleur'
    )
    
    cable_recommande = models.ForeignKey(  # ✅ Ajouter le câble
        Equipement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dimensionnements_cable'
    )

    class Meta:
        indexes = [
            models.Index(fields=['date_calcul']),  # Indexation pour date_calcul
            models.Index(fields=['user']),  # Indexation pour user
            models.Index(fields=['entree']),  # Indexation pour entree
        ]

    def __str__(self):
        return f"Dimensionnement {self.id} - {self.date_calcul}"

    # Calcul optimisé lors de la sauvegarde de l'objet
    def save(self, *args, **kwargs):
        # Calculs optimisés pour la puissance totale, capacité de batterie et bilan énergétique
        self.puissance_totale = self.nombre_panneaux * self.capacite_batterie
        self.bilan_energetique_annuel = self.puissance_totale * 365  # Exemple d'estimation annuelle
        self.cout_total = self.calculer_cout_total()  # Fonction à créer pour calculer le coût total

        # Appeler la méthode de sauvegarde parente pour persister les données
        super().save(*args, **kwargs)

    # Méthode pour calculer le coût total (exemple d'implémentation)
    def calculer_cout_total(self):
        cout_panneau = self.panneau_recommande.prix_unitaire if self.panneau_recommande else 0
        cout_batterie = self.batterie_recommandee.prix_unitaire if self.batterie_recommandee else 0
        cout_regulateur = self.regulateur_recommande.prix_unitaire if self.regulateur_recommande else 0
        cout_onduleur = self.onduleur_recommande.prix_unitaire if self.onduleur_recommande else 0
        cout_cable = self.cable_recommande.prix_unitaire if self.cable_recommande else 0

        return (
            (cout_panneau * self.nombre_panneaux) +
            (cout_batterie * self.nombre_batteries) +
            cout_regulateur +
            cout_onduleur +
            cout_cable
        )
 