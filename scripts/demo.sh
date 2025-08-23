#!/bin/bash
echo "🎯 Préparation de la démonstration"

# Arrêt propre
docker compose down

# Nettoyage
docker system prune -f

# Redémarrage avec logs
docker compose up -d

# Attente des services
sleep 15

# Tests automatiques
echo "🧪 Tests des services..."
curl -f http://localhost:8000/health/ || echo "⚠️ Backend non disponible"
curl -f http://localhost:3000/ || echo "⚠️ Frontend non disponible"

echo "✅ Application prête pour la démonstration"
echo "📖 Consultez docs/DEMO_SCENARIO.md pour le scénario"