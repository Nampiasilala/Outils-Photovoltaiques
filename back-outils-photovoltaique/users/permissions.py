# users/permissions.py
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
