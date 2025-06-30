# Outils Photovoltaïques - Application Fullstack

## Description

Application web fullstack composée de :

- Backend Django 5.2.3 avec API REST sécurisée par JWT  
- Base de données PostgreSQL 15  
- Frontend Next.js (React) avec Tailwind CSS  

Le tout conteneurisé avec Docker Compose pour faciliter le déploiement et le développement.

## Prérequis

- Docker installé (https://docs.docker.com/get-docker/)  
- Docker Compose (commande `docker compose`) (https://docs.docker.com/compose/install/)

## Installation et lancement

1. Cloner le projet  
   git clone <url-du-repo>  
   cd <nom-du-repo>

2. Créer un fichier `.env` à la racine (exemple):  
   DJANGO_SECRET_KEY=ta_clef_secrète  
   DJANGO_DEBUG=True  

   DB_NAME=dimensionnement  
   DB_USER=devuser  
   DB_PASSWORD=devpass  
   DB_HOST=db  
   DB_PORT=5432  

3. Lancer les conteneurs  
   docker compose up --build

  - Mode production : docker compose -f docker-compose.yml up --build

  - Mode développement : juste docker compose up si docker-compose.override.yml est présent

4. Backend Django accessible sur : http://localhost:8000  
5. Frontend Next.js accessible sur : http://localhost:3000

## Commandes utiles

- Arrêter les conteneurs :  
  docker compose down

- Voir les logs :  
  docker compose logs -f

- Exécuter une commande dans le conteneur backend :  
  docker compose exec backend python manage.py migrate

## Structure du projet

/
├── back-outils-photovoltaique/  # Backend Django  
├── front-outils-photovoltaique/ # Frontend Next.js  
├── docker-compose.yml            # Orchestration Docker  
├── .env                         # Variables d'environnement (non versionné)  
└── .gitignore                   # Fichiers ignorés par Git  

## Notes

- Ne jamais versionner le fichier `.env` contenant des secrets  
- Pour la production, prévoir d’utiliser un serveur web (nginx), Gunicorn, et une vraie gestion des secrets