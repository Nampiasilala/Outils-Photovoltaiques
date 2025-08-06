from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ParametreSysteme
from .serializers import ParametreSystemeSerializer
from rest_framework.response import Response

class ParametreSystemeViewSet(viewsets.ModelViewSet):
    # Filtrage des paramètres pour l'utilisateur authentifié
    queryset = ParametreSysteme.objects.all()
    serializer_class = ParametreSystemeSerializer

    # Permission pour s'assurer que l'utilisateur est authentifié
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Limite le queryset aux paramètres du user authentifié.
        """
        user = self.request.user
        return ParametreSysteme.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        """
        Méthode list pour gérer la pagination et améliorer les performances
        """
        queryset = self.get_queryset()
        # Optimisation avec select_related pour éviter les requêtes N+1
        queryset = queryset.select_related('user')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """
        Lorsque tu crées un nouvel objet ParametreSysteme, on associe directement l'utilisateur connecté.
        """
        serializer.save(user=self.request.user)
