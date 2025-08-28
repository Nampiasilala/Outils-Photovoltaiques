# dimensionnements/views.py
import logging
from decimal import Decimal
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle

from users.permissions import IsAdminUserApp, ReadOnlyOrAdmin
from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from .utils import compute_dimensionnement, get_equipements_recommandes
from donnees_entree.models import DonneesEntree
from parametres.services import get_or_create_global_params
from django.db import transaction

logger = logging.getLogger(__name__)

# 👇 petite classe throttle dédiée au scope "dimension_create"
class DimensionCreateThrottle(ScopedRateThrottle):
    scope = "dimension_create"

class DimensionnementViewSet(viewsets.ModelViewSet):
    """
    - CRUD : admin (ou lecture publique si tu préfères ReadOnlyOrAdmin)
    - POST /api/dimensionnements/calculate/ : public (sans auth, throttlé)
    """
    serializer_class = DimensionnementSerializer
    permission_classes = [IsAdminUserApp]       # CRUD admin only
    # permission_classes = [ReadOnlyOrAdmin]    # (option) GET public, écritures admin

    def get_queryset(self):
        return (
            Dimensionnement.objects
            .select_related(
                'entree', 'parametre',
                'panneau_recommande', 'batterie_recommandee',
                'regulateur_recommande', 'onduleur_recommande', 'cable_recommande'
            )
            .order_by('-date_calcul')
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='calculate',
        permission_classes=[permissions.AllowAny],  # ✅ public
        authentication_classes=[],                  # ✅ aucune auth → pas de CSRF
        throttle_classes=[DimensionCreateThrottle], # ✅ 10/min (cf settings)
    )
    def calculate(self, request):
        # 1) Validation
        input_ser = CalculationInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)
        data = input_ser.validated_data

        # 2) Paramètres effectifs (singleton)
        param = get_or_create_global_params()

        # 3) Calcul
        try:
            calculated = compute_dimensionnement(
                {
                    "E_jour":      Decimal(str(data["E_jour"])),
                    "P_max":       Decimal(str(data["P_max"])),
                    "N_autonomie": Decimal(str(data["N_autonomie"])),
                    "H_solaire":   Decimal(str(data["H_solaire"])),
                    "V_batterie":  Decimal(str(data["V_batterie"])),
                },
                param
            )
        except ValueError as e:
            logger.error(f"Erreur de calcul/équipement: {e}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception("Erreur inattendue lors du calcul.")
            return Response({"detail": "Erreur interne."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # dimensionnements/views.py (méthode calculate)
        ...
        with transaction.atomic():
            entree = DonneesEntree.objects.create(
                e_jour=data["E_jour"],
                p_max=data["P_max"],
                n_autonomie=data["N_autonomie"],
                localisation=data.get("localisation", ""),
                v_batterie=data["V_batterie"],
                h_solaire=data["H_solaire"],
            )

            dim = Dimensionnement.objects.create(
                entree=entree,
                parametre=param,
                puissance_totale=calculated["puissance_totale"],
                capacite_batterie=calculated["capacite_batterie"],
                nombre_panneaux=calculated["nombre_panneaux"],
                nombre_batteries=calculated["nombre_batteries"],
                bilan_energetique_annuel=calculated["bilan_energetique_annuel"],
                cout_total=calculated["cout_total"],

                # FKs
                panneau_recommande=calculated.get("panneau_recommande"),
                batterie_recommandee=calculated.get("batterie_recommandee"),
                regulateur_recommande=calculated.get("regulateur_recommande"),
                onduleur_recommande=calculated.get("onduleur_recommande"),
                cable_recommande=calculated.get("cable_recommande"),

                # Topologies si tu les as ajoutées au modèle
                nb_batt_serie=calculated.get("nb_batt_serie"),
                nb_batt_parallele=calculated.get("nb_batt_parallele"),
                topologie_batterie=calculated.get("topologie_batterie"),
                nb_pv_serie=calculated.get("nb_pv_serie"),
                nb_pv_parallele=calculated.get("nb_pv_parallele"),
                topologie_pv=calculated.get("topologie_pv"),
            )

        # Base de réponse sûre
        resp = DimensionnementSerializer(dim).data

        # Ajouts pour le front (tous JSON-compatibles)
        resp["equipements_recommandes"] = get_equipements_recommandes(dim)
        resp["longueur_cable_global_m"] = calculated.get("longueur_cable_global_m")  # float
        resp["prix_cable_global"] = calculated.get("prix_cable_global")              # float
        resp["dimensionnement_id"] = dim.id

        return Response(resp, status=status.HTTP_201_CREATED)
