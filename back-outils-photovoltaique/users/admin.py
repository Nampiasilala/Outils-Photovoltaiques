# users/admin.py
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _

User = get_user_model()

def _has_field(model, name: str) -> bool:
    return any(f.name == name for f in model._meta.get_fields())

_HAS_USERNAME = _has_field(User, "username")
_HAS_EMAIL = _has_field(User, "email")
_FIELDS = {f.name for f in User._meta.get_fields()}

# Champs utilitaires qui existent peut-être sur ton modèle
_PERSONAL = [f for f in ("first_name", "last_name", "email", "phone", "role") if f in _FIELDS]
_PERMISSION = [f for f in ("is_active", "is_staff", "is_superuser", "groups", "user_permissions") if f in _FIELDS]
_DATES = [f for f in ("last_login", "date_joined") if f in _FIELDS]

if _HAS_USERNAME:
    # Cas le plus courant : modèle basé sur AbstractUser (champ username présent)
    @admin.register(User)
    class UserAdmin(DjangoUserAdmin):
        """Admin pour User ≈ AbstractUser (+ champs perso si présents)."""

        # colonnes de la liste
        list_display = tuple(
            [f for f in ("username", "email", "first_name", "last_name") if f in _FIELDS]
        ) + tuple([f for f in ("is_staff", "is_active") if f in _FIELDS])

        list_filter = tuple([f for f in ("is_staff", "is_superuser", "is_active", "groups") if f in _FIELDS])
        search_fields = tuple([f for f in ("username", "email", "first_name", "last_name") if f in _FIELDS])
        ordering = ("-date_joined",) if "date_joined" in _FIELDS else ("id",)

        # sections du formulaire de modification
        fieldsets = (
            (None, {"fields": tuple([f for f in ("username", "password") if f in _FIELDS])}),
            (_("Personal info"), {"fields": tuple(_PERSONAL)}) if _PERSONAL else None,
            (_("Permissions"), {"fields": tuple(_PERMISSION)}) if _PERMISSION else None,
            (_("Important dates"), {"fields": tuple(_DATES)}) if _DATES else None,
        )
        # retire les None éventuels
        fieldsets = tuple(fs for fs in fieldsets if fs is not None)

        # formulaire d’ajout (utilise les formulaires de DjangoUserAdmin)
        # On garde le comportement standard (username + password1/password2).
else:
    # Modèle sans username (souvent AbstractBaseUser avec email comme identifiant)
    @admin.register(User)
    class UserAdmin(admin.ModelAdmin):
        """Admin minimal mais fonctionnel pour modèle sans 'username'.

        - Affiche et permet d'éditer les champs usuels.
        - Hash le password si tu saisis un mot de passe en clair dans le formulaire.
        """

        # colonnes de liste
        list_display = tuple(
            [f for f in ("email", "first_name", "last_name") if f in _FIELDS]
        ) + tuple([f for f in ("is_staff", "is_active") if f in _FIELDS])

        list_filter = tuple([f for f in ("is_staff", "is_superuser", "is_active", "groups") if f in _FIELDS])
        search_fields = tuple([f for f in ("email", "first_name", "last_name") if f in _FIELDS])
        ordering = ("-date_joined",) if "date_joined" in _FIELDS else ("id",)

        # champs affichés dans le formulaire (adaptés à ce qui existe)
        fields = (
            tuple([f for f in ("email", "password") if f in _FIELDS])
            + tuple(_PERSONAL)
            + tuple(_PERMISSION)
            + tuple(_DATES)
        )

        readonly_fields = tuple([f for f in ("last_login", "date_joined") if f in _FIELDS])

        def save_model(self, request, obj, form, change):
            """Hash le mot de passe saisi en clair si nécessaire."""
            pwd = form.cleaned_data.get("password")
            # Si un mot de passe lisible est saisi, on le hash
            if pwd and not str(pwd).startswith(("pbkdf2_", "argon2", "bcrypt")):
                obj.set_password(pwd)
            super().save_model(request, obj, form, change)
