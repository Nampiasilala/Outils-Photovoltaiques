from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonneesEntreeViewSet

router = DefaultRouter()
router.register(r'', DonneesEntreeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
