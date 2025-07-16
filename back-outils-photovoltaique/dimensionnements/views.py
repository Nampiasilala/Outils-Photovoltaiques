import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny  # ou IsAuthenticated selon votre besoin
from rest_framework.response import Response

from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from .utils import compute_dimensionnement

from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from equipements.models import Equipement

logger = logging.getLogger(__name__)

class DimensionnementViewSet(viewsets.ModelViewSet):
    queryset = Dimensionnement.objects.all()
    serializer_class = DimensionnementSerializer
    # permission_classes = [IsAuthenticated]  # remettez-le pour la prod

    @action(detail=False, methods=['post'])
    @permission_classes([AllowAny])  # autorise temporairement pour debug
    def calculate(self, request):
        # 1) Validation
        input_ser = CalculationInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)
        data = input_ser.validated_data

        # 2) Récupération du paramètre système
        try:
            param = ParametreSysteme.objects.get(user=request.user)
        except ParametreSysteme.DoesNotExist:
            return Response(
                {'detail': 'Paramètre système introuvable pour cet utilisateur.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3) Équipements
        panneau = Equipement.objects.filter(categorie__iexact='panneau').first()
        batterie= Equipement.objects.filter(categorie__iexact='batterie').first()
        if not panneau or not batterie:
            return Response(
                {'detail': 'Équipements panneau ou batterie manquants.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 4) Calcul métier
        result = compute_dimensionnement(data, param, {
            'panneau': panneau,
            'batterie': batterie,
        })

        # 5) Création de l’historique DonneesEntree
        entree = DonneesEntree.objects.create(
            e_jour      = data['E_jour'],
            p_max       = data['P_max'],
            n_autonomie = data['N_autonomie'],
            localisation= data['localisation'],   # <— ici on passe la localisation
            v_batterie  = data['V_batterie'],
            user        = request.user,
        )

        # 6) Sauvegarde du résultat
        dimensionnement = Dimensionnement.objects.create(
            entree                    = entree,
            parametre                 = param,
            puissance_totale          = result['puissance_totale'],
            capacite_batterie         = result['capacite_batterie'],
            nombre_panneaux           = result['nombre_panneaux'],
            bilan_energetique_annuel  = result['bilan_energetique_annuel'],
            cout_total                = result['cout_total'],
        )

        # 7) Sérialisation et réponse
        out_ser = DimensionnementSerializer(dimensionnement)
        return Response(out_ser.data, status=status.HTTP_201_CREATED)
