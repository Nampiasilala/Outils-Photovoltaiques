from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserApp(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated and (
                getattr(u, "role", "").lower() == "admin" or u.is_staff or u.is_superuser
            )
        )

class ReadOnlyOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return IsAdminUserApp().has_permission(request, view)

class IsAdminOrSelf(BasePermission):
    """
    Admin : tout est permis.
    Non-admin : accès uniquement à SON propre objet utilisateur en GET/PATCH/PUT.
    Pas de DELETE.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if IsAdminUserApp().has_permission(request, view):
            return True
        is_self = (getattr(obj, "pk", None) == getattr(request.user, "pk", None))
        if not is_self:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.method in ("PUT", "PATCH"):
            return True
        return False
