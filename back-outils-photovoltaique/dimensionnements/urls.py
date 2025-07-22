
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DimensionnementViewSet

router = DefaultRouter()
# CORRECTION : Spécifier explicitement le basename
router.register(r'', DimensionnementViewSet, basename='dimensionnement')

urlpatterns = [
    path('', include(router.urls)),
]
