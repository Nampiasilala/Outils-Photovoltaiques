# parametres/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import ParametreSysteme
from .serializers import ParametreSystemeSerializer
from .services import get_or_create_global_params


class ParametreSystemeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour paramètres système globaux (singleton logique)
    """
    queryset = ParametreSysteme.objects.all().order_by("-id")
    serializer_class = ParametreSystemeSerializer
    permission_classes = [IsAuthenticated]  # par défaut

    def get_queryset(self):
        return ParametreSysteme.objects.all().order_by("-id")

    def create(self, request, *args, **kwargs):
        """
        Bloque la création multiple via la route standard
        """
        if ParametreSysteme.objects.exists():
            return Response(
                {"detail": "Un jeu de paramètres existe déjà."},
                status=status.HTTP_409_CONFLICT
            )
        return super().create(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["get", "put", "patch"],  # ✅ GET, PUT, PATCH
        url_path="effective",
        permission_classes=[AllowAny],    # Public si souhaité
    )
    def effective(self, request, *args, **kwargs):
        """
        GET    -> renvoie l'objet unique
        PUT    -> mise à jour complète
        PATCH  -> mise à jour partielle
        """
        obj = get_or_create_global_params()

        if request.method.lower() == "get":
            serializer = self.get_serializer(obj)
            return Response(serializer.data)

        partial_update = request.method.lower() == "patch"
        serializer = self.get_serializer(
            obj,
            data=request.data,
            partial=partial_update
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
