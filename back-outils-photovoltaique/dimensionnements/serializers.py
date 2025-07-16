from rest_framework import serializers
from .models import Dimensionnement

class CalculationInputSerializer(serializers.Serializer):
    E_jour      = serializers.FloatField(min_value=0.1)
    P_max       = serializers.FloatField(min_value=0.1)
    N_autonomie = serializers.IntegerField(min_value=1)
    H_solaire   = serializers.FloatField(min_value=0.1)
    V_batterie  = serializers.ChoiceField(choices=[12, 24, 48])
    localisation = serializers.CharField(max_length=255)  # <— ajouté
class DimensionnementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Dimensionnement
        fields = [
            "id",
            "date_calcul",
            "puissance_totale",
            "capacite_batterie",
            "nombre_panneaux",
            "bilan_energetique_annuel",
            "cout_total",
            "entree",
            "parametre",
        ]
        read_only_fields = fields
