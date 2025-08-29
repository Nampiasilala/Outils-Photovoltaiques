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
    serializer_class = RegisterSerializer


class LoginView(generics.GenericAPIView):
    """Connexion de l'utilisateur et retour du token JWT + role."""
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # compat email/username
        user = authenticate(request, email=email, username=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "role": (user.role or "").capitalize(),  # "Admin" / "Entreprise" / "Utilisateur"
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                }
            })

        return Response(
            {"detail": "Email ou mot de passe invalide"},
            status=status.HTTP_401_UNAUTHORIZED
        )


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"detail": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        if request.user != user:
            return Response({"detail": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"detail": "Mot de passe changé avec succès."}, status=status.HTTP_200_OK)


# ✅ NOUVEAU : /api/users/me
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "role": (u.role or "").capitalize(),
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        })
