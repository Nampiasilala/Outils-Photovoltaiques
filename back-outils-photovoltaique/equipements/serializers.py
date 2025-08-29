from rest_framework import serializers
from .models import Equipement

class EquipementSerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Equipement
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

    def get_created_by_email(self, obj):
        try:
            return getattr(obj.created_by, "email", None)
        except Exception:
            return None

    def create(self, validated_data):
        # Celui qui crée = propriétaire logique
        user = self.context["request"].user
        validated_data["created_by"] = user if user and user.is_authenticated else None
        return super().create(validated_data)