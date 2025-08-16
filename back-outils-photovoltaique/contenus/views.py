# contenus/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from users.permissions import IsAdminUserApp  # assure-toi que ce chemin est correct
from .models import HelpContent
from .serializers import HelpContentSerializer


class HelpContentPublicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API publique en lecture seule.
    Expose :
      - GET /api/contenus/public/                          (liste des contenus actifs)
      - GET /api/contenus/public/<id>/                     (détail)
      - GET /api/contenus/public/by-key/<key>/             (par clé)
      - GET /api/contenus/public/help-by-key/?keys=a,b,c   (par liste de clés)
    """
    queryset = HelpContent.objects.filter(is_active=True)
    serializer_class = HelpContentSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"], url_path=r"by-key/(?P<key>[^/]+)")
    def by_key(self, request, key=None):
        try:
            content = self.get_queryset().get(key=key)
            return Response(self.get_serializer(content).data)
        except HelpContent.DoesNotExist:
            return Response({"error": "Contenu non trouvé"}, status=404)

    @action(detail=False, methods=["get"], url_path="help-by-key")
    def help_by_key(self, request):
        """
        GET /api/contenus/public/help-by-key/?keys=e_jour,p_max,...
        Renvoie une liste d'objets (filtrés sur is_active=True).
        """
        keys_param = request.query_params.get("keys", "")
        keys = [k.strip() for k in keys_param.split(",") if k.strip()]
        if not keys:
            return Response([])

        qs = self.get_queryset().filter(key__in=keys)
        data = self.get_serializer(qs, many=True).data
        return Response(data)


class HelpContentAdminViewSet(viewsets.ModelViewSet):
    """
    API admin complète (CRUD).
    Expose :
      - /api/contenus/admin/
      - /api/contenus/admin/<key>/
    """
    queryset = HelpContent.objects.all()
    serializer_class = HelpContentSerializer
    permission_classes = [IsAdminUserApp]
    lookup_field = "key"
