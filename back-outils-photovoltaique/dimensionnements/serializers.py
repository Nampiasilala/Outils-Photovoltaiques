# dimensionnements/serializers.py

from rest_framework import serializers
from .models import Dimensionnement
from equipements.models import Equipement
from decimal import Decimal # Importer Decimal si vous l'utilisez pour la conversion

# Serializer pour valider les données d'entrée de la requête de calcul
class CalculationInputSerializer(serializers.Serializer):
    E_jour      = serializers.FloatField(min_value=0.1)
    P_max       = serializers.FloatField(min_value=0.1)
    N_autonomie = serializers.IntegerField(min_value=1)
    H_solaire   = serializers.FloatField(min_value=0.1)
    V_batterie  = serializers.ChoiceField(choices=[12, 24, 48])
    localisation = serializers.CharField(max_length=255)

# Serializer pour afficher les détails d'un équipement (panneau, batterie, régulateur)
class EquipementDetailSerializer(serializers.ModelSerializer):
    # Convertir les champs DecimalField en float pour la sortie JSON
    # Utilisez SerializerMethodField pour les champs qui peuvent être null
    # ou si vous voulez un contrôle plus fin sur la conversion.
    # Sinon, un simple FloatField(source='votre_champ') peut suffire.

    # Exemple pour puissance, capacite, tension, prix_unitaire
    # Si ces champs peuvent être null dans la base de données, gérons-les avec SerializerMethodField
    puissance = serializers.SerializerMethodField()
    capacite = serializers.SerializerMethodField()
    tension = serializers.SerializerMethodField()
    prix_unitaire = serializers.SerializerMethodField()

    class Meta:
        model = Equipement
        fields = ['id', 'modele', 'puissance', 'capacite', 'tension', 'prix_unitaire']
        # Assurez-vous que 'modele' existe sur votre modèle Equipement.
        # Sinon, utilisez 'nom' ou 'type_equipement' selon votre modèle et ajustez le frontend.

    # Méthodes pour convertir les DecimalField en float, gérant les valeurs null
    def get_puissance(self, obj):
        return float(obj.puissance) if obj.puissance is not None else None

    def get_capacite(self, obj):
        return float(obj.capacite) if obj.capacite is not None else None

    def get_tension(self, obj):
        return float(obj.tension) if obj.tension is not None else None

    def get_prix_unitaire(self, obj):
        return float(obj.prix_unitaire) if obj.prix_unitaire is not None else None


# Serializer principal pour le modèle Dimensionnement (inchangé, car déjà correct)
class DimensionnementSerializer(serializers.ModelSerializer):
    equipements_recommandes = serializers.SerializerMethodField()

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
            "entree",
            "parametre",
            "equipements_recommandes",
        ]

    def get_equipements_recommandes(self, obj):
        data = {}
        if obj.panneau_recommande:
            data['panneau'] = EquipementDetailSerializer(obj.panneau_recommande).data
        else:
            data['panneau'] = None

        if obj.batterie_recommandee:
            data['batterie'] = EquipementDetailSerializer(obj.batterie_recommandee).data
        else:
            data['batterie'] = None

        if obj.regulateur_recommande:
            data['regulateur'] = EquipementDetailSerializer(obj.regulateur_recommande).data
        else:
            data['regulateur'] = None
            
        return data
