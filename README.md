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

- Nettoyer le cache Docker : Si tu as déjà exécuté des constructions précédentes et que des volumes ou cache ont été créés, essaie de supprimer les caches Docker avec la commande suivante :
  docker builder prune --all

## Structure du projet

├── back-outils-photovoltaique/  # Backend Django  
├── front-outils-photovoltaique/ # Frontend Next.js  
├── docker-compose.yml            # Orchestration Docker  
├── .env                         # Variables d'environnement (non versionné)  
└── .gitignore                   # Fichiers ignorés par Git  

## Notes

- Ne jamais versionner le fichier `.env` contenant des secrets  
- Pour la production, prévoir d’utiliser un serveur web (nginx), Gunicorn, et une vraie gestion des secrets
----------------------------------------------------------------------------------------------------------------------
python3 --version Python 3.11.2

python --version Python 3.11.2

python3 -m django --version 5.2.3

Pour le package : pip freeze asgiref==3.8.1 Django==5.2.3 sqlparse==0.5.3

psql --version psql (PostgreSQL) 15.13 (Debian 15.13-0+deb12u1)

node --version v22.16.0

npm --version 10.9.2

npm list --depth=0 outils-photovoltaique@0.1.0 /home/nampiasilala/Outils-Photovoltaiques/front-outils-photovoltaique ├── @radix-ui/react-slot@1.2.3 ├── @types/axios@0.9.36 ├── @types/node@22.15.32 ├── @types/react-dom@18.3.7 ├── @types/react@18.3.23 ├── autoprefixer@10.4.21 ├── axios@1.10.0 ├── class-variance-authority@0.7.1 ├── clsx@2.1.1 ├── daisyui@5.0.43 ├── eslint-config-next@15.3.4 ├── eslint@8.57.1 ├── lucide-react@0.522.0 ├── next@15.3.4 ├── postcss@8.5.6 ├── react-dom@18.3.1 ├── react-icons@5.5.0 ├── react@18.3.1 ├── tailwind-merge@3.3.1 ├── tailwindcss-animate@1.0.7 ├── tailwindcss@3.4.17 └── typescript@5.8.3

npm install react-toastify  ## bibliothèque pour notification : pupops non bloquant
