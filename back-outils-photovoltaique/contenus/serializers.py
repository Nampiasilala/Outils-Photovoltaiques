# contenus/serializers.py - ✅ Pour référence
from rest_framework import serializers
from .models import HelpContent

class HelpContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpContent
        fields = ("id", "key", "title", "body_html", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")