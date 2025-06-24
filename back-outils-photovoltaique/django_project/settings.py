import os
from pathlib import Path

# Chemin de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-4_@z!k1e@v#8sd$j-7v(0%$=!y3z8#1w6v+e3!*@7w2q&^o(2_)'

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',          # Admin Django
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',       # Sessions nécessaires pour auth
    'django.contrib.messages',       # Messages nécessaires pour admin
    'django.contrib.staticfiles',    # Gestion des fichiers statiques

    'rest_framework',
    'rest_framework_simplejwt',
    'users',                        # Ton app utilisateurs
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',      # Obligatoire avant AuthenticationMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',   # Obligatoire pour admin et auth
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'django_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],    # Ajoute ici tes dossiers de templates si besoin
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',    # Obligatoire pour admin
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_project.wsgi.application'

# Configuration de la base de données PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dimensionnement',
        'USER': 'devuser',
        'PASSWORD': 'devpass',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Modèle utilisateur personnalisé
AUTH_USER_MODEL = 'users.User'

# Configuration Django REST Framework avec JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Paramètre important pour la génération automatique de clé primaire
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# URL pour les fichiers statiques (CSS, JS, images)
STATIC_URL = '/static/'

# Optionnel : dossier où collecter les fichiers statiques en prod
# STATIC_ROOT = BASE_DIR / 'staticfiles'

# Pour le développement uniquement
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']
