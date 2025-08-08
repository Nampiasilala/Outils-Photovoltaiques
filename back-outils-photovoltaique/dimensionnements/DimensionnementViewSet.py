from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import logging
from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from .utils import compute_dimensionnement

logger = logging.getLogger(__name__)

class DimensionnementViewSet(viewsets.ModelViewSet):
    queryset = Dimensionnement.objects.all()
    serializer_class = DimensionnementSerializer

    @action(detail=False, methods=['post'])
    @permission_classes([AllowAny])
    def calculate(self, request):
        logger.debug(f"Requête reçue : {request.data}")
        logger.debug(f"En-têtes reçus : {dict(request.headers)}")

        # Validation des données d'entrée
        input_ser = CalculationInputSerializer(data=request.data)
        if not input_ser.is_valid():
            logger.error(f"Erreurs de validation : {input_ser.errors}")
            return Response(input_ser.errors, status=status.HTTP_400_BAD_REQUEST)

        data = input_ser.validated_data

        # Récupération du paramètre système avec `select_related` si nécessaire
        param = ParametreSysteme.objects.first()
        if not param:
            logger.error("Aucun paramètre système trouvé.")
            return Response(
                {'detail': 'Aucun paramètre système disponible.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calcul métier, et gestion d'exception si le calcul échoue
        try:
            result = compute_dimensionnement(data, param)
        except ValueError as e:
            logger.error(f"Erreur dans compute_dimensionnement : {str(e)}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Création de l'historique DonneesEntree
        entree = DonneesEntree.objects.create(
            e_jour=data['E_jour'],
            p_max=data['P_max'],
            n_autonomie=data['N_autonomie'],
            localisation=data['localisation'],
            v_batterie=data['V_batterie'],
            user=request.user,  # Pas d'utilisateur pour les requêtes non authentifiées
        )

        # Création du Dimensionnement avec `select_related` pour optimiser les relations
        dimensionnement = Dimensionnement.objects.create(
            entree=entree,
            parametre=param,
            puissance_totale=result['puissance_totale'],
            capacite_batterie=result['capacite_batterie'],
            nombre_panneaux=result['nombre_panneaux'],
            bilan_energetique_annuel=result['bilan_energetique_annuel'],
            cout_total=result['cout_total'],
        )

        # Sérialisation et renvoi de la réponse avec les données calculées
        out_ser = DimensionnementSerializer(dimensionnement)
        return Response(out_ser.data, status=status.HTTP_201_CREATED)
