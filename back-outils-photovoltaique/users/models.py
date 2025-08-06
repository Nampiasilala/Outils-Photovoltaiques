from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True, db_index=True)  # Indexation pour améliorer la recherche par email
    role = models.CharField(max_length=50, default="Utilisateur", db_index=True)  # Indexation du rôle
    status = models.CharField(max_length=20, default="Actif", db_index=True)  # Indexation du statut
    department = models.CharField(max_length=50, blank=True, null=True)  # Vérifier si `null=True` est vraiment nécessaire ici

    # Définir `USERNAME_FIELD` et `REQUIRED_FIELDS` pour l'authentification basée sur email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username est requis pour la création d'un utilisateur

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        
    def __str__(self):
        return f"{self.username} ({self.email})"