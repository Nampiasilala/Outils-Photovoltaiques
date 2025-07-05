# from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Equipement
from .serializers import EquipementSerializer

class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
