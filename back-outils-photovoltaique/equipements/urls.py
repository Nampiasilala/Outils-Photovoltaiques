from rest_framework.routers import DefaultRouter
from .views import EquipementViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', EquipementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
