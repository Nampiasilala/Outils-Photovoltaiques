from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role", "date_joined")
        read_only_fields = ("id", "date_joined")
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True},
            # "role": {"read_only": True},  # décommente si tu veux éviter l’escalade côté API
        }

    def create(self, validated_data):
        # ✅ utilise le manager pour hasher le mot de passe
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    # `password` optionnel et write_only pour UPDATE; appliqué seulement s’il est fourni
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "status", "date_joined", "last_login", "password")
        read_only_fields = ("id", "date_joined", "last_login")
        # Si tu veux empêcher le changement de rôle par l’API :
        # extra_kwargs = {"role": {"read_only": True}}

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
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
        from django.contrib.auth import authenticate

        email = attrs.get("email")
        password = attrs.get("password")
        if not email or not password:
            raise serializers.ValidationError("Email et mot de passe sont requis.")

        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if user is None:
            # fallback si backend d’auth ne prend pas email
            u = User.objects.filter(email=email).first()
            if not u or not u.check_password(password):
                raise serializers.ValidationError({"detail": "Identifiants invalides."})
            if not u.is_active:
                raise serializers.ValidationError({"detail": "Compte désactivé."})
            user = u

        attrs["user"] = user
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
