# from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Dimensionnement
from .serializers import DimensionnementSerializer

class DimensionnementViewSet(viewsets.ModelViewSet):
    queryset = Dimensionnement.objects.all()
    serializer_class = DimensionnementSerializer
