from rest_framework.routers import DefaultRouter
from .views import ParametreSystemeViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', ParametreSystemeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
