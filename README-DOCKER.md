# README - Développement et Gestion Docker

# Comment lancer localement ou non le projet ? Comment faire si va apporter des modifications ?

## Installation et Configuration

### Prérequis

- Docker et Docker Compose installés
- Ports 3000, 8000, 5433 disponibles

### Configuration initiale

```bash
git clone <votre-repo>
cd Outils-Photovoltaiques
cp .env.example .env  # Ajuster les variables si nécessaire
```

## Modes de Développement

### Mode Docker (Recommandé)

**Développement avec build local :**

```bash
docker compose up -d
# Utilise docker-compose.override.yml automatiquement
# Build local + live reload activé
```

**Test distribution avec images Docker Hub :**

```bash
docker compose -f docker-compose.yml up -d
# Utilise les images publiées sur Docker Hub
# Installation rapide, pas de compilation
```

### Mode Local Traditionnel

**Démarrer seulement la base de données :**

```bash
docker compose up -d db
```

**Backend local :**

```bash
cd back-outils-photovoltaique
export DB_HOST=localhost
export DB_PORT=5433
python manage.py runserver
# Accès: http://localhost:8000
```

**Frontend local :**

```bash
cd front-outils-photovoltaique
npm run dev
# Accès: http://localhost:3000
```

## Gestion des Images Docker Hub

### Mise à jour après modifications

```bash
# 1. Rebuilder les images
docker build -t nampiasilala/outils-photovoltaiques-backend ./back-outils-photovoltaique
docker build -t nampiasilala/outils-photovoltaiques-frontend ./front-outils-photovoltaique

# 2. Pousser vers Docker Hub
docker push nampiasilala/outils-photovoltaiques-backend
docker push nampiasilala/outils-photovoltaiques-frontend
```

### Quand mettre à jour

- Avant chaque version stable/démo
- Ajout de fonctionnalités majeures
- Corrections critiques
- Pas pour chaque petite modification de dev

## Commandes Utiles

### Statut et logs

```bash
# Voir les conteneurs
docker compose ps

# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
```

### Base de données

```bash
# Migrations
docker compose exec backend python manage.py migrate

# Créer superuser
docker compose exec backend python manage.py createsuperuser

# Console Django
docker compose exec backend python manage.py shell
```

### Nettoyage

```bash
# Arrêter les services
docker compose down

# Nettoyer les images inutilisées
docker system prune -f

# Reconstruction complète
docker compose up --build -d
```

## Structure des Fichiers

```
Outils-Photovoltaiques/
├── docker-compose.yml           # Images Docker Hub
├── docker-compose.override.yml  # Build local pour dev
├── .env                        # Variables d'environnement
├── back-outils-photovoltaique/ # Backend Django
└── front-outils-photovoltaique/ # Frontend Next.js
```

## Variables d'Environnement

```env
# Base de données
DB_NAME=dimensionnement
DB_USER=devuser
DB_PASSWORD=devpass
DB_HOST=db
DB_PORT=5432

# Django
DJANGO_SECRET_KEY=votre_clé
DJANGO_DEBUG=1
```

## Accès aux Services

- Frontend: http://localhost:3000
- Backend Admin: http://localhost:8000/admin
- API: http://localhost:8000/api
- Base de données: localhost:5433

## Dépannage

### Ports occupés

```bash
sudo lsof -i :3000 :8000 :5433
kill <PID>
```

### Problèmes de conteneurs

```bash
# Redémarrer un service
docker compose restart backend

# Voir les logs d'erreur
docker compose logs backend
```

### Remise à zéro complète

```bash
docker compose down -v
docker system prune -a -f --volumes
docker compose up --build -d
```

## Workflow Recommandé

### Développement quotidien

1. `docker compose up -d`
2. Développer normalement
3. `docker compose down` à la fin

### Avant release

1. `docker compose -f docker-compose.yml up -d` (test)
2. Mettre à jour les images Docker Hub
3. Tester installation complète
