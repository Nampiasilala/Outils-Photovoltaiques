from django.contrib import admin
from django.urls import path, include
from users.views import RegisterView, LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
