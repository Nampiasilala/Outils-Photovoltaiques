from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # On ne garde que les champs utiles. PAS de first_name / last_name / last_login.
        fields = ("id", "username", "email", "password", "role", "date_joined")
        read_only_fields = ("id", "date_joined")
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True},
            # Si tu veux empêcher l’escalade de privilèges, mets role en read_only côté API
            # "role": {"read_only": True},
        }

    def create(self, validated_data):
        # Assure un mot de passe hashé
        password = validated_data.pop("password")
        # Utilise le manager pour créer proprement l’utilisateur
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    # Si tu as USERNAME_FIELD = 'email', on authentifie avec l’email
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email is None or password is None:
            raise serializers.ValidationError("Email et mot de passe sont requis.")

        # Utilise authenticate() pour respecter la config d’auth (backends, is_active, etc.)
        user = authenticate(request=self.context.get("request"), email=email, password=password)

        # Si authenticate() ne gère pas l'email chez toi, tu peux fallback :
        if user is None:
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

        # Règles simples de complexité (exemple)
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
