from rest_framework import serializers
from .models import Dimensionnement

class DimensionnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dimensionnement
        fields = '__all__'
