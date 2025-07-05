#from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import DonneesEntree
from .serializers import DonneesEntreeSerializer

class DonneesEntreeViewSet(viewsets.ModelViewSet):
    queryset = DonneesEntree.objects.all()
    serializer_class = DonneesEntreeSerializer
