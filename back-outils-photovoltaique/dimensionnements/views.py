import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated # Importer IsAuthenticated
from rest_framework.response import Response

from .models import Dimensionnement
from .serializers import DimensionnementSerializer, CalculationInputSerializer
from .utils import compute_dimensionnement

from donnees_entree.models import DonneesEntree
from parametres.models import ParametreSysteme
from equipements.models import Equipement # Non directement utilisé ici pour la récupération, mais pour le modèle

logger = logging.getLogger(__name__)

class DimensionnementViewSet(viewsets.ModelViewSet):
    queryset = Dimensionnement.objects.all()
    serializer_class = DimensionnementSerializer
    # permission_classes = [IsAuthenticated] # Remettez-le pour la production

    @action(detail=False, methods=['post'])
    @permission_classes([AllowAny]) # Autorise temporairement pour debug, à remplacer par IsAuthenticated en prod
    def calculate(self, request):
        # 1) Validation des données d'entrée
        input_ser = CalculationInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)
        data = input_ser.validated_data

        # 2) Récupération du paramètre système
        # Gérer le cas où l'utilisateur n'est pas authentifié (si AllowAny est utilisé)
        user = request.user if request.user.is_authenticated else None
        
        if user:
            try:
                param = ParametreSysteme.objects.get(user=user)
            except ParametreSysteme.DoesNotExist:
                return Response(
                    {'detail': 'Paramètre système introuvable pour cet utilisateur.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Si pas d'utilisateur connecté, utiliser un paramètre par défaut ou lever une erreur
            # Pour l'exemple, prenons le premier paramètre disponible ou un ID spécifique (ex: 1)
            try:
                param = ParametreSysteme.objects.first() # Ou .get(id=1)
                if not param:
                    return Response(
                        {'detail': 'Aucun paramètre système par défaut trouvé.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            except Exception as e:
                return Response(
                    {'detail': f'Erreur lors de la récupération du paramètre système: {e}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


        # 3) Calcul métier (compute_dimensionnement choisit déjà les équipements)
        # Les lignes de récupération de panneau et batterie ici sont supprimées car
        # compute_dimensionnement s'en charge et retourne les objets Equipement.
        try:
            calculated_results = compute_dimensionnement(data, param)
        except ValueError as e:
            logger.error(f"Erreur de calcul ou équipement manquant: {e}")
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception("Erreur inattendue lors du calcul du dimensionnement.")
            return Response(
                {'detail': f"Erreur interne lors du calcul: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4) Création de l’historique DonneesEntree
        # Assurez-vous que le champ 'user' dans DonneesEntree est nullable ou géré pour les utilisateurs non connectés
        entree = DonneesEntree.objects.create(
            e_jour      = data['E_jour'],
            p_max       = data['P_max'],
            n_autonomie = data['N_autonomie'],
            localisation= data['localisation'],
            v_batterie  = data['V_batterie'],
            user        = user, # Assignez l'utilisateur (peut être None)
        )

        # 5) Sauvegarde du résultat Dimensionnement
        # C'est la partie CRUCIALE : assigner les objets Equipement aux ForeignKeys
        dimensionnement = Dimensionnement.objects.create(
            entree                    = entree,
            parametre                 = param,
            puissance_totale          = calculated_results['puissance_totale'],
            capacite_batterie         = calculated_results['capacite_batterie'],
            nombre_panneaux           = calculated_results['nombre_panneaux'],
            nombre_batteries          = calculated_results['nombre_batteries'], # <-- AJOUTÉ
            bilan_energetique_annuel  = calculated_results['bilan_energetique_annuel'],
            cout_total                = calculated_results['cout_total'],
            # ASSIGNATION DES OBJETS EQUIPEMENT AUX CHAMPS FOREIGNKEY
            panneau_recommande        = calculated_results['panneau_recommande'],
            batterie_recommandee      = calculated_results['batterie_recommandee'],
            regulateur_recommande     = calculated_results['regulateur_recommande'],
        )

        # 6) Sérialisation et réponse
        out_ser = DimensionnementSerializer(dimensionnement)
        return Response(out_ser.data, status=status.HTTP_201_CREATED)

