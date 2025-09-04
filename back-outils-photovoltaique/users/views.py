from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer, UserSerializer,
)
from .permissions import IsAdminUserApp, IsAdminOrSelf

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "role": (user.role or "").capitalize(),
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
                "phone": user.phone,
                "address": user.address,
                "website": user.website,
                "description": user.description,
            }
        })

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUserApp]
    def get_serializer_class(self):
        return RegisterSerializer if self.request.method == "POST" else UserSerializer

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSelf]

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
        serializer.save()
        return Response({"detail": "Mot de passe changé avec succès."}, status=status.HTTP_200_OK)

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
            "phone": u.phone,
            "address": u.address,
            "website": u.website,
            "description": u.description,
            "date_joined": u.date_joined,
            "last_login": u.last_login,
        })

class ToggleActiveView(APIView):
    permission_classes = [IsAdminUserApp]

    def patch(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"detail": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        if "is_active" in request.data:
            new_val = bool(request.data["is_active"])
        else:
            new_val = not user.is_active

        user.is_active = new_val
        user.save(update_fields=["is_active"])
        return Response({"id": user.id, "is_active": user.is_active}, status=status.HTTP_200_OK)
