# parametres/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import ParametreSysteme
from .serializers import ParametreSystemeSerializer
from .services import get_or_create_global_params
from users.permissions import IsAdminUserApp

class ParametreSystemeViewSet(viewsets.ModelViewSet):
    queryset = ParametreSysteme.objects.all().order_by("-id")
    serializer_class = ParametreSystemeSerializer

    # Auth globale = JWT
    authentication_classes = [JWTAuthentication]
    # Par défaut: admin only
    permission_classes = [IsAdminUserApp]

    def get_permissions(self):
        # /parametres/effective/ : GET public, PUT/PATCH admin
        if getattr(self, "action", None) == "effective":
            if self.request.method == "GET":
                return [AllowAny()]
            return [IsAdminUserApp()]
        return [perm() for perm in self.permission_classes]

    def create(self, request, *args, **kwargs):
        if ParametreSysteme.objects.exists():
            return Response({"detail": "Un jeu de paramètres existe déjà."},
                            status=status.HTTP_409_CONFLICT)
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=["get", "put", "patch"], url_path="effective")
    def effective(self, request, *args, **kwargs):
        obj = get_or_create_global_params()

        if request.method == "GET":
            serializer = self.get_serializer(obj)
            return Response(serializer.data)

        partial = request.method == "PATCH"
        serializer = self.get_serializer(obj, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
