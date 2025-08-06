from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Créer un nouvel utilisateur."""
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    """Connexion de l'utilisateur et retour du token JWT."""
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"]
        )

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        return Response(
            {"detail": "Identifiants invalides."},
            status=status.HTTP_401_UNAUTHORIZED
        )


class UserListCreateView(generics.ListCreateAPIView):
    """Lister ou créer des utilisateurs."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # permission_classes = [permissions.IsAdminUser]


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """Voir, modifier ou supprimer un utilisateur."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # permission_classes = [permissions.IsAdminUser]


class ChangePasswordView(APIView):
    """Changer le mot de passe d’un utilisateur."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response(
                {"detail": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user != user:
            return Response(
                {"detail": "Action non autorisée."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"detail": "Mot de passe changé avec succès."},
            status=status.HTTP_200_OK
        )
