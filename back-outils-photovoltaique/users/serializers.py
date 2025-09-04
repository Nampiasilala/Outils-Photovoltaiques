from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "password", "role", "date_joined",
            "phone", "address", "website", "description",
        )
        read_only_fields = ("id", "date_joined")
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True},
            "role": {"required": False, "default": "Entreprise"},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("is_active", None)
        user = User.objects.create_user(
            password=password,
            is_active=False,  # ✳️ nouvel inscrit inactif
            **validated_data
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "role", "date_joined", "last_login",
            "phone", "address", "website", "description",
            "is_active", "password",
        )
        read_only_fields = ("id", "date_joined", "last_login")
        extra_kwargs = {"is_active": {"required": False}}

    # ⚠️ BIEN **DANS** LA CLASSE (indentation) :
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        request = self.context.get("request")
        is_admin = bool(
            request and request.user.is_authenticated and (
                getattr(request.user, "role", "").lower() == "admin"
                or request.user.is_staff or request.user.is_superuser
            )
        )
        if not is_admin:
            # anti-élévation de privilèges
            for k in ("is_active", "role", "is_staff", "is_superuser"):
                validated_data.pop(k, None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        if not email or not password:
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        u = User.objects.filter(email__iexact=email).first()
        if not u or not u.check_password(password):
            raise AuthenticationFailed("INVALID_CREDENTIALS")

        if not u.is_active:
            raise PermissionDenied("INACTIVE_ACCOUNT")

        attrs["user"] = u
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context["request"].user
        if not user.check_password(data["old_password"]):
            raise serializers.ValidationError({"old_password": "Mot de passe actuel incorrect."})
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})
        pwd = data["new_password"]
        if not any(c.isdigit() for c in pwd):
            raise serializers.ValidationError({"new_password": "Doit contenir au moins un chiffre."})
        if not any(c.isupper() for c in pwd):
            raise serializers.ValidationError({"new_password": "Doit contenir au moins une majuscule."})
        if not any(c.islower() for c in pwd):
            raise serializers.ValidationError({"new_password": "Doit contenir au moins une minuscule."})
        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
