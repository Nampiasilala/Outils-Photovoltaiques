import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes as api_permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from .utils import compute_dimensionnement
from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from equipements.models import Equipement

logger = logging.getLogger(__name__)

class DimensionnementViewSet(viewsets.ModelViewSet):
    serializer_class = DimensionnementSerializer
    # permission_classes = [IsAuthenticated] # REMETTEZ CETTE LIGNE POUR LA PRODUCTION

    def get_queryset(self):
        """
        Récupère les dimensionnements uniquement pour l'utilisateur authentifié.
        Utilise `select_related` pour optimiser les requêtes.
        """
        if self.request.user.is_authenticated:
            # Optimisation : Utilisation de `select_related` pour éviter les requêtes N+1.
            return Dimensionnement.objects.select_related(
                'entree__user', 'parametre', 'panneau_recommande', 'batterie_recommandee', 'regulateur_recommande'
            ).filter(entree__user=self.request.user).order_by('-date_calcul')
        return Dimensionnement.objects.none()

    @action(detail=False, methods=['post'])
    @api_permission_classes([AllowAny])  # Access public pour les utilisateurs non authentifiés
    def calculate(self, request):
        """
        Action personnalisée pour effectuer le calcul du dimensionnement.
        """

        # 1) Validation des données d'entrée
        input_ser = CalculationInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)  # Validation immédiate
        data = input_ser.validated_data

        # 2) Récupération du paramètre système
        user = request.user if request.user.is_authenticated else None
        param = self.get_parametre_systeme(user)
        if not param:
            return Response({'detail': 'Paramètre système introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # 3) Calcul métier
        try:
            calculated_results = compute_dimensionnement(data, param)
        except ValueError as e:
            logger.error(f"Erreur de calcul ou équipement manquant: {e}")
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Erreur inattendue lors du calcul du dimensionnement.")
            return Response({'detail': f"Erreur interne lors du calcul: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4) Création de l’historique DonneesEntree
        entree = DonneesEntree.objects.create(
            e_jour=data['E_jour'],
            p_max=data['P_max'],
            n_autonomie=data['N_autonomie'],
            localisation=data['localisation'],
            v_batterie=data['V_batterie'],
            user=user,
        )

        # 5) Sauvegarde du résultat Dimensionnement
        dimensionnement = Dimensionnement.objects.create(
            entree=entree,
            parametre=param,
            puissance_totale=calculated_results['puissance_totale'],
            capacite_batterie=calculated_results['capacite_batterie'],
            nombre_panneaux=calculated_results['nombre_panneaux'],
            nombre_batteries=calculated_results['nombre_batteries'],
            bilan_energetique_annuel=calculated_results['bilan_energetique_annuel'],
            cout_total=calculated_results['cout_total'],
            panneau_recommande=calculated_results['panneau_recommande'],
            batterie_recommandee=calculated_results['batterie_recommandee'],
            regulateur_recommande=calculated_results['regulateur_recommande'],
            user=user,
        )

        # 6) Sérialisation et réponse
        out_ser = DimensionnementSerializer(dimensionnement)
        return Response(out_ser.data, status=status.HTTP_201_CREATED)

    def get_parametre_systeme(self, user):
        """
        Récupère le paramètre système, soit celui lié à l'utilisateur, soit par défaut.
        """
        try:
            if user:
                # Récupération du paramètre spécifique à l'utilisateur
                return ParametreSysteme.objects.get(user=user)
            # Récupération du paramètre système par défaut
            return ParametreSysteme.objects.first()
        except ParametreSysteme.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du paramètre système : {e}")
            return None
