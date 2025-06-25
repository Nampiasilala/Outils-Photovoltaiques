from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'  # Utilise email pour l'authentification
    REQUIRED_FIELDS = ['username']  # Champs requis lors de la création