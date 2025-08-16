from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.views import RegisterView, LoginView

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),

    # Inscription / Login custom (si vous souhaitez garder ces vues)
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',    LoginView.as_view(),    name='login'),

    # Endpoints JWT (SimpleJWT)
    path('api/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),

    # Vos apps REST
    path('api/users/',           include('users.urls')),
    path('api/donnees/',         include('donnees_entree.urls')),
    path('api/parametres/',      include('parametres.urls')),
    path('api/equipements/',     include('equipements.urls')),
    path('api/dimensionnements/', include('dimensionnements.urls')),
    path('api/contenus/', include('contenus.urls')), 
]
