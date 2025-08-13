# apps/parametres/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class ParametreSysteme(models.Model):
    # Rendements / coefficients
    n_global = models.FloatField(
        default=0.75, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    k_securite = models.FloatField(
        default=1.30, validators=[MinValueValidator(1.0)]
    )
    dod = models.FloatField(  # profondeur de décharge (0..1)
        default=0.50, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    k_dimensionnement = models.FloatField(
        default=1.25, validators=[MinValueValidator(1.0)]
    )

    # ➜ Nouveaux paramètres demandés
    s_max = models.FloatField(  # seuil de surdimensionnement (0..1)
        default=0.25,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Seuil de surdimensionnement autorisé pour modules PV/batteries (0–1).",
    )
    i_sec = models.FloatField(   # marge courant régulateur
        default=1.25,
        validators=[MinValueValidator(1.0)],
        help_text="Facteur de sécurité sur le courant régulateur (ex. 1.25).",
    )

    # Métadonnées
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Paramètres système (id={self.id})"

    class Meta:
        verbose_name = "Paramètres système"
        verbose_name_plural = "Paramètres système"
        # Pas d'index user (supprimé)
