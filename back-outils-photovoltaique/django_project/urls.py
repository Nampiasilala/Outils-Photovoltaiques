from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView, LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('api/users/', include('users.urls')),
    path('api/donnees/', include('donnees_entree.urls')),
    path('api/parametres/', include('parametres.urls')),
    path('api/equipements/', include('equipements.urls')),
    path('api/dimensionnements/', include('dimensionnements.urls')),
]
