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
from .utils import compute_dimensionnement
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

        with transaction.atomic():
            entree = DonneesEntree.objects.create(
                e_jour=data["E_jour"],
                p_max=data["P_max"],
                n_autonomie=data["N_autonomie"],
                localisation=data.get("localisation", ""),
                v_batterie=data["V_batterie"],
                h_solaire=data["H_solaire"],  # ✅ on archive ce qui a servi au calcul
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
                panneau_recommande=calculated["panneau_recommande"],
                batterie_recommandee=calculated["batterie_recommandee"],
                regulateur_recommande=calculated["regulateur_recommande"],
                onduleur_recommande=calculated.get("onduleur_recommande"),
                cable_recommande=calculated.get("cable_recommande"),
            )

        return Response(DimensionnementSerializer(dim).data, status=status.HTTP_201_CREATED)

        # 4) Sauvegarde entrée (anonyme)
        entree = DonneesEntree.objects.create(
            e_jour=data["E_jour"],
            p_max=data["P_max"],
            n_autonomie=data["N_autonomie"],
            localisation=data.get("localisation", ""),
            v_batterie=data["V_batterie"],
        )

        # 5) Sauvegarde résultat
        dim = Dimensionnement.objects.create(
            entree=entree,
            parametre=param,
            puissance_totale=calculated["puissance_totale"],
            capacite_batterie=calculated["capacite_batterie"],
            nombre_panneaux=calculated["nombre_panneaux"],
            nombre_batteries=calculated["nombre_batteries"],
            bilan_energetique_annuel=calculated["bilan_energetique_annuel"],
            cout_total=calculated["cout_total"],
            panneau_recommande=calculated["panneau_recommande"],
            batterie_recommandee=calculated["batterie_recommandee"],
            regulateur_recommande=calculated["regulateur_recommande"],
            onduleur_recommande=calculated.get("onduleur_recommande"),
            cable_recommande=calculated.get("cable_recommande"),
        )

        return Response(DimensionnementSerializer(dim).data, status=status.HTTP_201_CREATED)
