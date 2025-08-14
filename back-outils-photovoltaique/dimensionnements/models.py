# dimensionnements/models.py
from django.db import models
from equipements.models import Equipement
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme

class Dimensionnement(models.Model):
    date_calcul = models.DateTimeField(auto_now_add=True)

    # Valeurs calculées par le service compute_dimensionnement (source de vérité)
    puissance_totale = models.FloatField()
    capacite_batterie = models.FloatField()
    nombre_panneaux = models.IntegerField()
    nombre_batteries = models.IntegerField(default=0)
    bilan_energetique_annuel = models.FloatField()
    cout_total = models.FloatField()

    entree = models.ForeignKey(DonneesEntree, on_delete=models.CASCADE)
    parametre = models.ForeignKey(ParametreSysteme, on_delete=models.CASCADE)

    # Équipements recommandés (facultatifs)
    panneau_recommande = models.ForeignKey(
        Equipement, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dimensionnements_panneau'
    )
    batterie_recommandee = models.ForeignKey(
        Equipement, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dimensionnements_batterie'
    )
    regulateur_recommande = models.ForeignKey(
        Equipement, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dimensionnements_regulateur'
    )
    onduleur_recommande = models.ForeignKey(
        Equipement, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dimensionnements_onduleur'
    )
    cable_recommande = models.ForeignKey(
        Equipement, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='dimensionnements_cable'
    )

    class Meta:
        indexes = [
            models.Index(fields=['date_calcul']),
            models.Index(fields=['entree']),
        ]
        ordering = ['-date_calcul']

    def __str__(self):
        return f"Dimensionnement {self.pk} - {self.date_calcul:%Y-%m-%d %H:%M}"

    # --- Utilitaires optionnels (ne modifient pas la BD automatiquement) ---
    def calculer_cout_total(self) -> float:
        """
        Renvoie un coût estimé basé sur les équipements liés,
        SANS écrire en base. À appeler explicitement si tu veux recalculer.
        """
        def prix(e: Equipement | None) -> float:
            return float(e.prix_unitaire) if e and e.prix_unitaire is not None else 0.0

        cout = (
            prix(self.panneau_recommande) * (self.nombre_panneaux or 0) +
            prix(self.batterie_recommandee) * (self.nombre_batteries or 0) +
            prix(self.regulateur_recommande) +
            prix(self.onduleur_recommande) +
            prix(self.cable_recommande)
        )
        return float(cout)

    def recompute_fields_from_links(self):
        """
        Si tu veux recalculer certains champs à partir des liens (optionnel),
        fais-le manuellement dans une tâche/commande/vue admin au lieu de save().
        """
        self.cout_total = self.calculer_cout_total()
        # ne touche pas aux autres champs : ils viennent du service de calcul
