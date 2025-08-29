from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied

from .models import Equipement
from .serializers import EquipementSerializer


def _is_admin_user(u) -> bool:
    if not u or not getattr(u, "is_authenticated", False):
        return False
    role = (getattr(u, "role", "") or "").lower()
    return role == "admin" or getattr(u, "is_staff", False) or getattr(u, "is_superuser", False)

# Catalogue Admin = objets créés par un admin/staff/superuser OU anciens (NULL)
ADMIN_Q = (
    Q(created_by__role__iexact="admin") |
    Q(created_by__is_staff=True) |
    Q(created_by__is_superuser=True) |
    Q(created_by__isnull=True)
)

class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        u = self.request.user
        qs = Equipement.objects.all()

        if u and u.is_authenticated:
            if _is_admin_user(u):
                return qs.order_by("-id")
            if (getattr(u, "role", "") or "").lower() == "entreprise":
                return qs.filter(created_by=u).order_by("-id")
            return qs.filter(ADMIN_Q).order_by("-id")

        return qs.filter(ADMIN_Q).order_by("-id")

    def perform_create(self, serializer):
        u = self.request.user
        if not (u and u.is_authenticated):
            raise PermissionDenied("Authentification requise.")
        role = (getattr(u, "role", "") or "").lower()
        if not (_is_admin_user(u) or role == "entreprise"):
            raise PermissionDenied("Seuls Admin et Entreprise peuvent créer des équipements.")
        serializer.save(created_by=u)

    def perform_update(self, serializer):
        u = self.request.user
        obj = self.get_object()
        if not (_is_admin_user(u) or obj.created_by_id == getattr(u, "id", None)):
            raise PermissionDenied("Vous ne pouvez modifier que vos équipements.")
        serializer.save()

    def perform_destroy(self, instance):
        u = self.request.user
        if not (_is_admin_user(u) or instance.created_by_id == getattr(u, "id", None)):
            raise PermissionDenied("Vous ne pouvez supprimer que vos équipements.")
        return super().perform_destroy(instance)
