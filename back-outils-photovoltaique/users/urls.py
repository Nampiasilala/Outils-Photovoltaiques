from django.http import JsonResponse
from django.urls import path
from django.contrib import admin
from .views import RegisterView, LoginView

def test_view(request):
    return JsonResponse({"message": "Le serveur fonctionne !"})

urlpatterns = [
    path('test/', test_view),  # ➜ Route simple
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('admin/', admin.site.urls),
]
