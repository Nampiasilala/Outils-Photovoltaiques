# from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import ParametreSysteme
from .serializers import ParametreSystemeSerializer

class ParametreSystemeViewSet(viewsets.ModelViewSet):
    queryset = ParametreSysteme.objects.all()
    serializer_class = ParametreSystemeSerializer
