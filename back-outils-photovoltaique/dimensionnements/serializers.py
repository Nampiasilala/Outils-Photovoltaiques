from rest_framework import serializers
from .models import Dimensionnement
from equipements.models import Equipement
from donnees_entree.models import DonneesEntree  # Assure-toi que ce modèle existe bien
from decimal import Decimal

# Serializer pour valider les données d'entrée de la requête de calcul
class CalculationInputSerializer(serializers.Serializer):
    E_jour      = serializers.FloatField(min_value=0.1)
    P_max       = serializers.FloatField(min_value=0.1)
    N_autonomie = serializers.IntegerField(min_value=1)
    H_solaire   = serializers.FloatField(min_value=0.1)
    V_batterie  = serializers.ChoiceField(choices=[12, 24, 48])
    localisation = serializers.CharField(max_length=255)

# Serializer pour afficher les détails d'un équipement
class EquipementDetailSerializer(serializers.ModelSerializer):
    puissance = serializers.SerializerMethodField()
    capacite = serializers.SerializerMethodField()
    tension = serializers.SerializerMethodField()
    prix_unitaire = serializers.SerializerMethodField()

    class Meta:
        model = Equipement
        fields = ['id', 'modele', 'puissance', 'capacite', 'tension', 'prix_unitaire']

    def get_puissance(self, obj):
        return float(obj.puissance) if obj.puissance is not None else None

    def get_capacite(self, obj):
        return float(obj.capacite) if obj.capacite is not None else None

    def get_tension(self, obj):
        return float(obj.tension) if obj.tension is not None else None

    def get_prix_unitaire(self, obj):
        return float(obj.prix_unitaire) if obj.prix_unitaire is not None else None

# ✅ Nouveau : serializer pour afficher les détails des données d'entrée
class DonneesEntreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonneesEntree
        fields = ['e_jour', 'p_max', 'n_autonomie', 'v_batterie', 'localisation']

# Serializer principal pour le modèle Dimensionnement
class DimensionnementSerializer(serializers.ModelSerializer):
    equipements_recommandes = serializers.SerializerMethodField()
    date_calcul = serializers.SerializerMethodField()
    entree_details = DonneesEntreeSerializer(source='entree', read_only=True)  # ✅ Ajout ici

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
            "entree_details",  # ✅ Ce champ remplace 'entree' pour exposer les vraies données
            "parametre",
            "equipements_recommandes",
        ]

    def get_date_calcul(self, obj):
        if hasattr(obj.date_calcul, 'date'):
            return obj.date_calcul.date().isoformat()
        return obj.date_calcul

    def get_equipements_recommandes(self, obj):
        return {
            'panneau': EquipementDetailSerializer(obj.panneau_recommande).data if obj.panneau_recommande else None,
            'batterie': EquipementDetailSerializer(obj.batterie_recommandee).data if obj.batterie_recommandee else None,
            'regulateur': EquipementDetailSerializer(obj.regulateur_recommande).data if obj.regulateur_recommande else None,
        }
