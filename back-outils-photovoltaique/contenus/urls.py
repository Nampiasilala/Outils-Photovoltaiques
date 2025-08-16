# contenus/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HelpContentPublicViewSet, HelpContentAdminViewSet

router = DefaultRouter()
router.register(r"public", HelpContentPublicViewSet, basename="contents-public")
router.register(r"admin", HelpContentAdminViewSet, basename="contents-admin")

urlpatterns = [
    path("", include(router.urls)),
]
