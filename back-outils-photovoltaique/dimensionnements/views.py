# dimensionnements/views.py
import logging
from decimal import Decimal

from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes as api_permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from .utils import compute_dimensionnement

from donnees_entree.models import DonneesEntree
from parametres.services import get_or_create_global_params

logger = logging.getLogger(__name__)

class DimensionnementViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal.
    - CRUD standard (public)
    - Action custom: POST /api/dimensionnements/calculate/ (publique)
    """
    serializer_class = DimensionnementSerializer
    permission_classes = [AllowAny]  # ✅ Public pour tous

    def get_queryset(self):
        # ✅ Retourne tous les dimensionnements (plus de filtre par user)
        return (
            Dimensionnement.objects
            .select_related(
                'entree', 'parametre',
                'panneau_recommande', 'batterie_recommandee',
                'regulateur_recommande', 'onduleur_recommande', 'cable_recommande'
            )
            .order_by('-date_calcul')
        )

    @action(detail=False, methods=['post'])
    @api_permission_classes([AllowAny])  # public
    def calculate(self, request):
        """
        POST /api/dimensionnements/calculate/
        Body JSON:
        {
          "E_jour": 1520,
          "P_max": 400,
          "N_autonomie": 1,
          "H_solaire": 5.0,
          "V_batterie": 12,
          "localisation": "Antananarivo"  // optionnel
        }
        """
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
        except Exception as e:
            logger.exception("Erreur inattendue lors du calcul.")
            return Response({"detail": f"Erreur interne: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4) Historisation de l'entrée (SANS user)
        entree = DonneesEntree.objects.create(
            e_jour=data["E_jour"],
            p_max=data["P_max"],
            n_autonomie=data["N_autonomie"],
            localisation=data.get("localisation", ""),
            v_batterie=data["V_batterie"],
            # user=user,  # ❌ SUPPRIMÉ
        )

        # 5) Persist du résultat (SANS user)
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
            # user=user,  # ❌ SUPPRIMÉ
        )

        # 6) Réponse
        return Response(DimensionnementSerializer(dim).data, status=status.HTTP_201_CREATED)