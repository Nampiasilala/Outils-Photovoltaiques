from rest_framework.routers import DefaultRouter
from .views import DimensionnementViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'', DimensionnementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
