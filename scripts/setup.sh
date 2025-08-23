#!/bin/bash
echo "🚀 Installation de l'application Outils Photovoltaïques"

# Vérification des prérequis
command -v docker >/dev/null 2>&1 || { echo "Docker requis"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose requis"; exit 1; }

# Vérification des ports
./scripts/check-ports.sh || exit 1

# Construction et démarrage
echo "📦 Construction des conteneurs..."
docker compose build

echo "🏃 Démarrage des services..."
docker compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 10

echo "🗄️ Application des migrations..."
docker compose exec backend python manage.py migrate

echo "📊 Chargement des données de test..."
docker compose exec backend python manage.py loaddata fixtures/demo_data.json

echo "✅ Installation terminée !"
echo "🌐 Frontend : http://localhost:3000"
echo "⚙️  Backend : http://localhost:8000/admin"