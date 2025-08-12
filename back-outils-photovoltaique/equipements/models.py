# apps/equipements/models.py
from django.db import models
from django.core.validators import MinValueValidator

DEC2 = {'max_digits': 12, 'decimal_places': 2, 'validators': [MinValueValidator(0)]}
DEC3 = {'max_digits': 12, 'decimal_places': 3, 'validators': [MinValueValidator(0)]}

class Equipement(models.Model):
    # --- Catégories (alignées avec ton code compute/choisir_equipement) ---
    class Categorie(models.TextChoices):
        PANNEAU = 'panneau_solaire', 'Panneau solaire'
        BATTERIE = 'batterie', 'Batterie'
        REGULATEUR = 'regulateur', 'Régulateur'
        ONDULEUR = 'onduleur', 'Onduleur'
        CABLE = 'cable', 'Câble'
        # Extensions possibles
        DISJONCTEUR = 'disjoncteur', 'Disjoncteur'
        PARAFEU = 'parafoudre', 'Parafoudre'
        SUPPORT = 'support', 'Support'
        BOITIER = 'boitier_jonction', 'Boîtier de jonction'
        CONNECTEUR = 'connecteur', 'Connecteur'
        MONITORING = 'monitoring', 'Monitoring'
        AUTRE = 'autre', 'Autre'

    class RegulatorType(models.TextChoices):
        MPPT = 'MPPT', 'MPPT'
        PWM = 'PWM', 'PWM'

    # --- Identité produit ---
    categorie = models.CharField(
        max_length=32, choices=Categorie.choices, db_index=True
    )
    reference = models.CharField(  # identifiant produit lisible (SKU, ref fabricant)
        max_length=64, unique=True, db_index=True
    )
    marque = models.CharField(max_length=64, blank=True, default='')
    modele = models.CharField(max_length=100, blank=True, default='')
    nom_commercial = models.CharField(  # affichage libre si besoin
        max_length=128, blank=True, default=''
    )
    
    
    # --- Prix ---
    prix_unitaire = models.DecimalField(**DEC2)  # en Ariary
    devise = models.CharField(max_length=8, default='MGA')  # Ariary malgache

    

    # --- Caractéristiques électriques génériques ---
    # NB: on utilise des noms explicites avec unités dans le suffixe
    puissance_W = models.DecimalField(**DEC2, null=True, blank=True)     # ex: Pmax module PV ou onduleur
    capacite_Ah = models.DecimalField(**DEC2, null=True, blank=True)     # batteries
    tension_nominale_V = models.DecimalField(**DEC3, null=True, blank=True)

    # --- Spécifiques PANNEAU ---
    vmp_V = models.DecimalField(**DEC3, null=True, blank=True)           # tension au MPP
    voc_V = models.DecimalField(**DEC3, null=True, blank=True)           # tension à vide

    # --- Spécifiques REGULATEUR ---
    type_regulateur = models.CharField(
        max_length=8, choices=RegulatorType.choices, null=True, blank=True
    )
    courant_A = models.DecimalField(**DEC3, null=True, blank=True)       # calibre en A (critère de sélection)
    pv_voc_max_V = models.DecimalField(**DEC3, null=True, blank=True)    # Voc PV max admissible
    mppt_v_min_V = models.DecimalField(**DEC3, null=True, blank=True)    # plage MPPT (si MPPT)
    mppt_v_max_V = models.DecimalField(**DEC3, null=True, blank=True)

    # --- Spécifiques ONDULEUR ---
    puissance_surgeb_W = models.DecimalField(**DEC2, null=True, blank=True)
    entree_dc_V = models.CharField(max_length=32, blank=True, default='')   # ex: "12/24" si multi
    sortie_ac_V = models.CharField(max_length=16, blank=True, default='230')
    frequence_Hz = models.DecimalField(**DEC3, null=True, blank=True)

    # --- Spécifiques CÂBLE ---
    section_mm2 = models.DecimalField(**DEC3, null=True, blank=True)
    ampacite_A = models.DecimalField(**DEC3, null=True, blank=True)      # critère de sélection pour cable

    # --- Divers ---
    disponible = models.BooleanField(default=True)
    datasheet_url = models.URLField(blank=True, default='')
    meta = models.JSONField(blank=True, null=True)  # champs libres (couleur, dimensions, etc.)

    class Meta:
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        indexes = [
            models.Index(fields=['categorie', 'prix_unitaire']),
            models.Index(fields=['categorie', 'puissance_W']),
            models.Index(fields=['categorie', 'capacite_Ah']),
            models.Index(fields=['categorie', 'courant_A']),
            models.Index(fields=['categorie', 'ampacite_A']),
        ]

    def __str__(self):
        label = self.nom_commercial or self.modele or self.reference
        return f"{self.get_categorie_display()} — {label}"

    # ---------- Helpers de cohérence (validation légère) ----------
    def clean(self):
        """
        Validation minimale par catégorie (sans surcharger).
        On exige uniquement les champs nécessaires à la sélection.
        """
        from django.core.exceptions import ValidationError

        if self.categorie == self.Categorie.PANNEAU:
            if self.puissance_W is None:
                raise ValidationError("Panneau: 'puissance_W' est requis.")
            # vmp/voc utiles mais optionnels (contrôles simplifiés)

        elif self.categorie == self.Categorie.BATTERIE:
            if self.capacite_Ah is None:
                raise ValidationError("Batterie: 'capacite_Ah' est requis.")
            if self.tension_nominale_V is None:
                raise ValidationError("Batterie: 'tension_nominale_V' est requis.")

        elif self.categorie == self.Categorie.REGULATEUR:
            if self.courant_A is None:
                raise ValidationError("Régulateur: 'courant_A' est requis.")
            if self.type_regulateur and self.type_regulateur == self.RegulatorType.MPPT:
                # pas obligatoire, mais recommandé : plages MPPT
                pass

        elif self.categorie == self.Categorie.ONDULEUR:
            if self.puissance_W is None:
                raise ValidationError("Onduleur: 'puissance_W' est requis.")
            # on encourage d'indiquer la/les tensions d'entrée DC:
            # exemple: '12', '24', '48' ou '12/24'
            # (contrôle stricte à ajouter si tu veux lier avec V_batterie)

        elif self.categorie == self.Categorie.CABLE:
            if self.ampacite_A is None:
                raise ValidationError("Câble: 'ampacite_A' est requis.")
            if self.section_mm2 is None:
                raise ValidationError("Câble: 'section_mm2' est requis.")
