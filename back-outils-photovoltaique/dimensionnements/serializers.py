from rest_framework import serializers
from .models import Dimensionnement
from equipements.models import Equipement
from donnees_entree.models import DonneesEntree

# Serializer pour valider les données d'entrée
class CalculationInputSerializer(serializers.Serializer):
    E_jour = serializers.FloatField(min_value=0.1)
    P_max = serializers.FloatField(min_value=0.1)
    N_autonomie = serializers.IntegerField(min_value=1)
    H_solaire = serializers.FloatField(min_value=0.1)
    V_batterie = serializers.ChoiceField(choices=[12, 24, 48])
    localisation = serializers.CharField(max_length=255)

# Serializer pour afficher les détails d'un équipement
class EquipementDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = ['id', 'modele', 'puissance', 'capacite', 'tension', 'prix_unitaire']
    
    # Optimisation : on n'a plus besoin des méthodes personnalisées car elles sont gérées directement par DRF
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Utilisation de float() directement si l'attribut est non null
        for field in ['puissance', 'capacite', 'tension', 'prix_unitaire']:
            if data.get(field) is not None:
                data[field] = float(data[field])
        return data

# Serializer pour afficher les détails des données d'entrée
class DonneesEntreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonneesEntree
        fields = ['e_jour', 'p_max', 'n_autonomie', 'v_batterie', 'localisation']

# Serializer principal pour le modèle Dimensionnement
class DimensionnementSerializer(serializers.ModelSerializer):
    equipements_recommandes = serializers.SerializerMethodField()
    date_calcul = serializers.SerializerMethodField()
    entree_details = DonneesEntreeSerializer(source='entree', read_only=True)

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
    
    # Optimisation : Formatage direct avec la méthode isoformat()
    def get_date_calcul(self, obj):
        return obj.date_calcul.isoformat() if obj.date_calcul else None

    # Optimisation : Simplification de la logique pour éviter des appels multiples
    def get_equipements_recommandes(self, obj):
        # Optimisation : on évite de faire plusieurs sérialiseurs si possible
        equipements = {
            'panneau': obj.panneau_recommande,
            'batterie': obj.batterie_recommandee,
            'regulateur': obj.regulateur_recommande
        }
        return {key: EquipementDetailSerializer(equipement).data if equipement else None for key, equipement in equipements.items()}
