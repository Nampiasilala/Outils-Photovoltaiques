from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    UserListCreateView,
    UserRetrieveUpdateDestroyView,
    ChangePasswordView,
    MeView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("", UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserRetrieveUpdateDestroyView.as_view(), name="user-detail"),
    path("<int:pk>/change-password/", ChangePasswordView.as_view(), name="change-password"),
]
