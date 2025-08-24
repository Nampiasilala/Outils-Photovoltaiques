import os
from pathlib import Path
from datetime import timedelta
import environ

# === Chemins de base ===
BASE_DIR = Path(__file__).resolve().parent.parent

# === Environnement (.env à la racine du backend) ===
env = environ.Env()
env_file = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_file):
    environ.Env.read_env(env_file)  # charge les variables si le fichier existe

# === Sécurité / Debug ===
SECRET_KEY = env("DJANGO_SECRET_KEY", default="django-insecure-key-not-set")
DEBUG = env.bool("DJANGO_DEBUG", default=True)

# Ex: DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,.ngrok-free.app"
ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", ".ngrok-free.app"],
)

# Ex: CSRF_TRUSTED_ORIGINS="http://localhost:3000,http://localhost:8000,https://*.ngrok-free.app"
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "https://*.ngrok-free.app",
    ],
)

# === Applications ===
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Tiers
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    # Local
    "users",
    "donnees_entree",
    "parametres",
    "equipements",
    "dimensionnements",
    "contenus",
]

# === Middleware ===
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise juste après SecurityMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# === CORS ===
# En prod réelle, préfère CORS_ALLOWED_ORIGINS au lieu d'ouvrir à tous.
CORS_ALLOW_ALL_ORIGINS = env.bool("CORS_ALLOW_ALL_ORIGINS", default=True)
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# === URL / WSGI ===
ROOT_URLCONF = "django_project.urls"
WSGI_APPLICATION = "django_project.wsgi.application"

# === Templates ===
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# === Base de données ===
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME", default="dimensionnement"),
        "USER": env("DB_USER", default="devuser"),
        "PASSWORD": env("DB_PASSWORD", default="devpass"),
        "HOST": env("DB_HOST", default="localhost"),
        "PORT": env("DB_PORT", default="5432"),
    }
}

# === Fichiers statiques & médias ===
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"  # requis pour collectstatic

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# WhiteNoise : compression + manifest pour prod
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# === Auth / DRF / JWT ===
AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/minute",
        "user": "120/minute",
        "dimension_create": "10/minute",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

AUTHENTICATION_BACKENDS = [
    "users.backends.EmailBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# === Divers ===
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
DEBUG_PROPAGATE_EXCEPTIONS = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"level": "DEBUG", "class": "logging.StreamHandler"}},
    "loggers": {"django": {"handlers": ["console"], "level": "INFO", "propagate": True}},
}
