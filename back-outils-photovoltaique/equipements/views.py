from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Equipement
from .serializers import EquipementSerializer
from rest_framework.decorators import action





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
        
        # 🔍 DEBUG - ajoutez ces lignes temporairement
        print(f"🔍 User: {u}, authenticated: {u.is_authenticated if u else 'None'}")
        print(f"🔍 User role: {getattr(u, 'role', 'NO_ROLE')}")
        print(f"🔍 is_admin_user: {_is_admin_user(u)}")
        
        if u and u.is_authenticated:
            if _is_admin_user(u):
                print("🔍 Admin access - all equipments")
                return qs.order_by("-id")
            if (getattr(u, "role", "") or "").lower() == "entreprise":
                filtered_qs = qs.filter(created_by=u).order_by("-id")
                print(f"🔍 Entreprise access - filtered to {filtered_qs.count()} equipments")
                return filtered_qs
            print("🔍 Public access - admin equipments only")
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



    @action(detail=False, methods=['get'], url_path='approuves')
    def approved_for_dimensioning(self, request):
        """Retourne seulement les équipements approuvés pour dimensionnement"""
        qs = Equipement.objects.filter(
            approuve_dimensionnement=True,
            disponible=True
        ).order_by("categorie", "prix_unitaire")
        
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='approve')
    def toggle_approval(self, request, pk=None):
        """Toggle l'approbation d'un équipement (admin seulement)"""
        if not _is_admin_user(request.user):
            raise PermissionDenied("Seuls les admins peuvent gérer les approbations.")
        
        equipement = self.get_object()
        new_status = request.data.get('approuve_dimensionnement')
        
        if new_status is not None:
            equipement.approuve_dimensionnement = bool(new_status)
            equipement.save(update_fields=['approuve_dimensionnement'])
            
            return Response({
                'id': equipement.id,
                'approuve_dimensionnement': equipement.approuve_dimensionnement,
                'message': 'Statut d\'approbation mis à jour'
            })
        
        return Response(
            {'error': 'Paramètre approuve_dimensionnement requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
    @action(detail=False, methods=['get'], url_path='debug')
    def debug_user(self, request):
        """Debug temporaire pour vérifier l'utilisateur"""
        u = request.user
        return Response({
            'user_id': u.id if u else None,
            'username': u.username if u else None,
            'email': u.email if u else None,
            'role': getattr(u, 'role', 'NO_ROLE'),
            'is_staff': getattr(u, 'is_staff', False),
            'is_superuser': getattr(u, 'is_superuser', False),
            'is_admin': _is_admin_user(u),
            'equipement_count': Equipement.objects.filter(created_by=u).count() if u else 0,
        })