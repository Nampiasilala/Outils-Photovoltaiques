# parametres/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import ParametreSysteme
from .serializers import ParametreSystemeSerializer
from .services import get_or_create_global_params
from users.permissions import IsAdminUserApp, ReadOnlyOrAdmin  # 👈 ajoute ces permissions

class ParametreSystemeViewSet(viewsets.ModelViewSet):
    """
    Paramètres système globaux (singleton logique).
    - CRUD : admin seulement
    - /effective : GET public, PUT/PATCH admin
    """
    queryset = ParametreSysteme.objects.all().order_by("-id")
    serializer_class = ParametreSystemeSerializer
    permission_classes = [IsAdminUserApp]  # 👈 admin par défaut

    def get_queryset(self):
        return ParametreSysteme.objects.all().order_by("-id")

    def create(self, request, *args, **kwargs):
        if ParametreSysteme.objects.exists():
            return Response(
                {"detail": "Un jeu de paramètres existe déjà."},
                status=status.HTTP_409_CONFLICT
            )
        return super().create(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["get", "put", "patch"],
        url_path="effective",
    )
    def effective(self, request, *args, **kwargs):
        """
        GET    -> public
        PUT    -> admin
        PATCH  -> admin
        """
        obj = get_or_create_global_params()

        # ⬇️ permission dynamique : GET public, sinon admin
        if request.method.lower() == "get":
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminUserApp]
        self.check_permissions(request)

        if request.method.lower() == "get":
            serializer = self.get_serializer(obj)
            return Response(serializer.data)

        partial_update = request.method.lower() == "patch"
        serializer = self.get_serializer(obj, data=request.data, partial=partial_update)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
