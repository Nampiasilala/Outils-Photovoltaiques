from rest_framework import serializers
from .models import Dimensionnement
from equipements.models import Equipement
from donnees_entree.models import DonneesEntree


# -------- Entrée de calcul (POST public) --------
class CalculationInputSerializer(serializers.Serializer):
    E_jour = serializers.FloatField(min_value=0.1)
    P_max = serializers.FloatField(min_value=0.1)
    N_autonomie = serializers.IntegerField(min_value=1)
    H_solaire = serializers.FloatField(min_value=0.1)
    V_batterie = serializers.ChoiceField(choices=[12, 24, 48])
    localisation = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs["H_solaire"] > 12:
            raise serializers.ValidationError({"H_solaire": "H_solaire doit être ≤ 12."})
        if attrs["E_jour"] > 1e6:
            raise serializers.ValidationError({"E_jour": "E_jour est trop grand."})
        if attrs["P_max"] > 1e6:
            raise serializers.ValidationError({"P_max": "P_max est trop grand."})
        loc = attrs.get("localisation")
        if loc is not None:
            attrs["localisation"] = loc.strip()
        return attrs


# -------- Détails équipement (dans la réponse) --------
class EquipementDetailSerializer(serializers.ModelSerializer):
    categorie_label = serializers.SerializerMethodField()

    class Meta:
        model = Equipement
        fields = [
            "id", "reference", "modele", "marque", "nom_commercial",
            "puissance_W", "capacite_Ah", "tension_nominale_V",
            "prix_unitaire", "devise", "categorie", "categorie_label",
        ]

    def get_categorie_label(self, obj):
        return obj.get_categorie_display()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for f in ("puissance_W", "capacite_Ah", "tension_nominale_V", "prix_unitaire"):
            if data.get(f) is not None:
                data[f] = float(data[f])
        return data


# -------- Données d'entrée (imbriqué en read-only) --------
class DonneesEntreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonneesEntree
        fields = ["id", "e_jour", "p_max", "n_autonomie", "v_batterie", "localisation"]
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # floats « continus »
        for f in ("e_jour", "p_max"):
            if data.get(f) is not None:
                try:
                    data[f] = float(data[f])
                except (TypeError, ValueError):
                    pass
        # entiers
        for f in ("n_autonomie", "v_batterie"):
            if data.get(f) is not None:
                try:
                    data[f] = int(float(data[f]))
                except (TypeError, ValueError):
                    pass
        return data


# -------- Résultat de dimensionnement --------
class DimensionnementSerializer(serializers.ModelSerializer):
    equipements_recommandes = serializers.SerializerMethodField()
    date_calcul = serializers.SerializerMethodField()
    entree_details = DonneesEntreeSerializer(source="entree", read_only=True)

    class Meta:
        model = Dimensionnement
        fields = [
            "id",
            "date_calcul",
            "puissance_totale",
            "capacite_batterie",
            "nombre_panneaux",
            "nombre_batteries",
            "bilan_energetique_annuel",
            "cout_total",
            "entree_details",
            "parametre",
            "equipements_recommandes",
        ]
        read_only_fields = fields

    def get_date_calcul(self, obj):
        return obj.date_calcul.isoformat() if obj.date_calcul else None

    def get_equipements_recommandes(self, obj):
        equipements = {
            "panneau": obj.panneau_recommande,
            "batterie": obj.batterie_recommandee,
            "regulateur": obj.regulateur_recommande,
            "onduleur": obj.onduleur_recommande,
            "cable": obj.cable_recommande,
        }
        return {k: (EquipementDetailSerializer(v).data if v else None) for k, v in equipements.items()}

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # entiers
        for f in ("nombre_panneaux", "nombre_batteries"):
            if data.get(f) is not None:
                try:
                    data[f] = int(data[f])
                except (TypeError, ValueError):
                    pass

        # floats
        for f in ("puissance_totale", "capacite_batterie", "bilan_energetique_annuel", "cout_total"):
            if data.get(f) is not None:
                try:
                    data[f] = float(data[f])
                except (TypeError, ValueError):
                    pass

        return data
