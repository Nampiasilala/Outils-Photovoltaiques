from rest_framework import serializers
from .models import DonneesEntree

class DonneesEntreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonneesEntree
        fields = '__all__'
