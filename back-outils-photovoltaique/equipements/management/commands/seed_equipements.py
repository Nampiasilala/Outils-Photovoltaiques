from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from uuid import uuid4

from equipements.models import Equipement

PANNEAU = "panneau_solaire"
BATTERIE = "batterie"
REGULATEUR = "regulateur"
ONDULEUR = "onduleur"
CABLE = "cable"
MGA = "MGA"

Panneaux = [
    ("Panneau 50W",  50,  Decimal("130000")),
    ("Panneau 100W", 100, Decimal("220000")),
    ("Panneau 200W", 200, Decimal("350000")),
    ("Panneau 300W", 300, Decimal("520000")),
]
Batteries = [
    ("Batterie 50Ah 12V",  50, 12, Decimal("380000")),
    ("Batterie 100Ah 12V", 100, 12, Decimal("680000")),
    ("Batterie 200Ah 12V", 200, 12, Decimal("1150000")),
]
Regulateurs = [
    ("MPPT 30A", "MPPT", 30, 100, 15,  75,  Decimal("420000")),
    ("MPPT 60A", "MPPT", 60, 150, 30, 120,  Decimal("780000")),
    ("PWM 30A",  "PWM",  30, 50,  18,  24,  Decimal("210000")),
]
Onduleurs = [
    ("Onduleur 500W",  500, 1000, "12",    "230", Decimal("520000")),
    ("Onduleur 1500W", 1500, 3000, "12/24", "230", Decimal("1250000")),
    ("Onduleur 3000W", 3000, 6000, "24/48", "230", Decimal("2850000")),
]
Cables = [
    ("Câble 4mm²",  4.0,  25, Decimal("6500")),
    ("Câble 6mm²",  6.0,  32, Decimal("8500")),
    ("Câble 10mm²", 10.0, 45, Decimal("12000")),
]

PREFIX = {
    PANNEAU:   "PAN",
    BATTERIE:  "BAT",
    REGULATEUR:"REG",
    ONDULEUR:  "OND",
    CABLE:     "CAB",
}
def make_ref(categorie: str) -> str:
    # Référence courte unique et lisible (ex: PAN-7F3A1C)
    return f"{PREFIX.get(categorie,'EQP')}-{uuid4().hex[:6].upper()}"

class Command(BaseCommand):
    help = "Insère un jeu de base d'équipements (MGA), idempotent."

    def handle(self, *args, **options):
        created_total = 0
        with transaction.atomic():
            # PANNEAUX
            for modele, w, prix in Panneaux:
                obj, created = Equipement.objects.update_or_create(
                    categorie=PANNEAU,
                    modele=modele,
                    defaults={
                        "puissance_W": w,
                        "prix_unitaire": prix,
                        "devise": MGA,
                        "disponible": True,
                    },
                )
                if created or not obj.reference:
                    obj.reference = make_ref(PANNEAU)
                    obj.save(update_fields=["reference"])
                created_total += int(created)

            # BATTERIES
            for modele, ah, v, prix in Batteries:
                obj, created = Equipement.objects.update_or_create(
                    categorie=BATTERIE,
                    modele=modele,
                    defaults={
                        "capacite_Ah": ah,
                        "tension_nominale_V": Decimal(v),
                        "prix_unitaire": prix,
                        "devise": MGA,
                        "disponible": True,
                    },
                )
                if created or not obj.reference:
                    obj.reference = make_ref(BATTERIE)
                    obj.save(update_fields=["reference"])
                created_total += int(created)

            # REGULATEURS
            for (modele, type_reg, courant, voc_max, mppt_v_min, mppt_v_max, prix) in Regulateurs:
                obj, created = Equipement.objects.update_or_create(
                    categorie=REGULATEUR,
                    modele=modele,
                    defaults={
                        "type_regulateur": type_reg,
                        "courant_A": Decimal(courant),
                        "pv_voc_max_V": Decimal(voc_max),
                        "mppt_v_min_V": Decimal(mppt_v_min),
                        "mppt_v_max_V": Decimal(mppt_v_max),
                        "prix_unitaire": prix,
                        "devise": MGA,
                        "disponible": True,
                    },
                )
                if created or not obj.reference:
                    obj.reference = make_ref(REGULATEUR)
                    obj.save(update_fields=["reference"])
                created_total += int(created)

            # ONDULEURS
            for (modele, p_w, surge_w, vdc, vac, prix) in Onduleurs:
                obj, created = Equipement.objects.update_or_create(
                    categorie=ONDULEUR,
                    modele=modele,
                    defaults={
                        "puissance_W": Decimal(p_w),
                        "puissance_surgeb_W": Decimal(surge_w),
                        "entree_dc_V": vdc,
                        "sortie_ac_V": vac,
                        "prix_unitaire": prix,
                        "devise": MGA,
                        "disponible": True,
                    },
                )
                if created or not obj.reference:
                    obj.reference = make_ref(ONDULEUR)
                    obj.save(update_fields=["reference"])
                created_total += int(created)

            # CÂBLES
            for (modele, section, ampacite, prix) in Cables:
                obj, created = Equipement.objects.update_or_create(
                    categorie=CABLE,
                    modele=modele,
                    defaults={
                        "section_mm2": Decimal(section),
                        "ampacite_A": Decimal(ampacite),
                        "prix_unitaire": prix,
                        "devise": MGA,
                        "disponible": True,
                    },
                )
                if created or not obj.reference:
                    obj.reference = make_ref(CABLE)
                    obj.save(update_fields=["reference"])
                created_total += int(created)

        self.stdout.write(self.style.SUCCESS(f"Seed terminé. Nouveaux objets créés: {created_total}"))
