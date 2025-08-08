from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # On marque le mot de passe comme write_only pour ne pas l'exposer dans les réponses
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'role', 'status', 'department',
            'first_name', 'last_name', 'date_joined', 'last_login'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False, 'min_length': 6}
        }

    def create(self, validated_data):
        # Utiliser create_user pour garantir un mot de passe haché
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

        
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        # Vérifier que l'utilisateur existe avant de vérifier le mot de passe
        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError({'email': 'Utilisateur non trouvé.'})

        if not user.check_password(password):
            raise serializers.ValidationError({'password': 'Mot de passe incorrect.'})

        return data

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context['request'].user

        # Vérification de l'ancien mot de passe
        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({'old_password': 'Mot de passe actuel incorrect.'})

        # Vérification que les nouveaux mots de passe correspondent
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Les mots de passe ne correspondent pas.'})

        # Vérification de la longueur du nouveau mot de passe
        if len(data['new_password']) < 6:
            raise serializers.ValidationError({'new_password': 'Le mot de passe doit contenir au moins 6 caractères.'})

        # Optionnel : ajouter des règles de complexité pour le mot de passe
        if not any(char.isdigit() for char in data['new_password']):
            raise serializers.ValidationError({'new_password': 'Le mot de passe doit contenir au moins un chiffre.'})

        if not any(char.isupper() for char in data['new_password']):
            raise serializers.ValidationError({'new_password': 'Le mot de passe doit contenir au moins une lettre majuscule.'})

        if not any(char.islower() for char in data['new_password']):
            raise serializers.ValidationError({'new_password': 'Le mot de passe doit contenir au moins une lettre minuscule.'})

        return data
