# Projet PORELO  

## check here : https://mirai.kaporelo.com/

Ce dépôt contient le code source complet de la plateforme PORELO (Backend, Frontend et Mobile).

## Structure du Projet

- **backend/** : API REST écrite en Go (Chi, Prisma, PostgreSQL).
- **porelo-front/** : Application web Frontend (Next.js, React).
- **porelo-mobile/** : Application mobile (React Native / Expo).

---

## Backend

### Prérequis

Pour faire tourner le backend, vous devez installer :

1.  **Go** (version 1.25 ou supérieure) :
    *   Télécharger et installer depuis [go.dev](https://go.dev/dl/).
2.  **PostgreSQL** :
    *   Installer un serveur PostgreSQL localement ou utiliser Docker.
    *   Créer une base de données (ex: `porelo`).
3.  **Client Prisma pour Go** :
    *   Installer via la commande :
        ```bash
        go install github.com/steebchen/prisma-client-go@latest
        ```

### Installation et Lancement

1.  **Se placer dans le dossier backend** :
    ```bash
    cd backend
    ```

2.  **Configurer les variables d'environnement** :
    *   Copier le fichier d'exemple :
        ```bash
        cp .env.example .env
        ```
    *   Modifier `.env` pour y mettre vos accès BDD (DATABASE_URL) et secrets.

3.  **Installer les dépendances et générer le client Prisma** :
    ```bash
    go mod download
    go run github.com/steebchen/prisma-client-go generate
    ```

4.  **Appliquer les migrations (création des tables)** :
    ```bash
    go run github.com/steebchen/prisma-client-go migrate dev
    ```

5.  **Lancer le serveur** :
    ```bash
    go run main.go
    ```
    Ou avec `fresh` si installé pour le rechargement automatique :
    ```bash
    fresh
    ```


Le serveur démarrera par défaut sur `http://localhost:3008`.

### Compte de test Admin (pour l'API)
Pour tester les endpoints protégés administrateur :
- **Email** : `momo@ynov.com`
- **Mot de passe** : `Password2025`


---

## Porelo-front (Frontend)

### Prérequis

- **Node.js** (LTS recommandé)
- **npm** ou **yarn**

### Installation et Lancement

1.  **Se placer dans le dossier frontend** :
    ```bash
    cd porelo-front
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

L'application sera accessible sur `http://localhost:3007`.

---
