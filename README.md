# TPALT — Plateforme de débat en ligne

Application de débat en temps réel avec matchmaking, classement Elo et analyse IA des arguments.

Disponible en ligne sur [tpalt.rboud.com](https://tpalt.rboud.com) *(l'IA est désactivée sur cette instance)*.

## Stack

- **Next.js 16** (App Router) avec serveur custom (WebSocket)
- **Prisma** + **SQLite** (via better-sqlite3)
- **TanStack Query**, **Tailwind CSS**, **Motion**
- **pnpm** comme gestionnaire de paquets

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) (`npm install -g pnpm` ou via corepack)

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet (un template est disponible dans `.env.template`) :

```env
# Chemin vers la base de données SQLite
# Par défaut : file:./prisma/dev.db
DATABASE_URL="file:./prisma/dev.db"

# (Optionnel) URL de l'API LLM compatible OpenAI
# Par défaut si non défini : pas d'IA
LLM_API_URL="https://api.groq.com/openai/v1/chat/completions"

# (Optionnel) Modèle LLM à utiliser
LLM_MODEL="llama-3.3-70b-versatile"

# (Optionnel) Clé API LLM nécessaire pour activer l'analyse IA
LLM_API_KEY="votre_clé_api"

# (Optionnel) Désactiver l'IA manuellement (true/false)
# Activé automatiquement si LLM_API_KEY n'est pas défini
DISABLE_IA=false
```

> Si `LLM_API_KEY` n'est pas fourni, l'IA est automatiquement désactivée et des réponses factices sont utilisées à la place.

---

## Lancer en développement

```bash
# 1. Installer les dépendances
pnpm install

# 2. Initialiser la base de données
pnpm prisma db push

# 3. Lancer le serveur de développement
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Build et lancement en production

```bash
# 1. Installer les dépendances
pnpm install

# 2. Initialiser la base de données
pnpm prisma db push

# 3. Compiler l'application
pnpm build

# 4. Démarrer le serveur
pnpm start
```

---

## Lancer avec Docker

### Build de l'image

```bash
docker build -t tpalt .
```

### Lancer le conteneur

```bash
docker run -d \
  -p 3000:3000 \
  -v tpalt_data:/data \
  -e LLM_API_KEY="votre_clé_api" \
  -e LLM_API_URL="https://api.groq.com/openai/v1/chat/completions" \
  -e LLM_MODEL="llama-3.3-70b-versatile" \
  --name tpalt \
  tpalt
```

- Le volume `/data` contient la base de données SQLite il faut le monter pour persister les données entre les redémarrages.
- Les variables d'environnement LLM sont optionnelles mais sans `LLM_API_KEY`, l'IA sera désactivée.
- Le port exposé est `3000`, à adapter selon votre configuration.

### Avec docker compose

```yaml
services:
  tpalt:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - tpalt_data:/data
    environment:
      - LLM_API_KEY=votre_clé_api
      - LLM_API_URL=https://api.groq.com/openai/v1/chat/completions
      - LLM_MODEL=llama-3.3-70b-versatile

volumes:
  tpalt_data:
```

```bash
docker compose up -d
```
