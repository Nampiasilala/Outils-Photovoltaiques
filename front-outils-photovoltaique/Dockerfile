FROM node:22-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances de prod uniquement
RUN npm install --omit=dev

# Copier le reste du code source
COPY . .

# Compiler l'app Next.js
RUN npm run build

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Commande de démarrage
CMD ["npx", "next", "start"]
