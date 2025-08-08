from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        print("👉 EmailBackend appelé avec :", email)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            print("⛔ Aucun utilisateur avec cet email")
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            print("✅ Authentification réussie")
            return user
        
        print("❌ Mot de passe incorrect")
        return None
