from rest_framework import serializers
from .models import ParametreSysteme

class ParametreSystemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametreSysteme
        fields = (
            "id",
            "n_global",
            "k_securite",
            "dod",
            "k_dimensionnement",
            "s_max",
            "i_sec",
            "updated_at",
        )
        read_only_fields = ("updated_at",)
