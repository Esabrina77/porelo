# Guide d'installation et utilisation de Swagger

## 📚 Documentation Swagger complète pour PORELO API

Cette API dispose d'une documentation Swagger interactive permettant de tester tous les endpoints directement depuis le navigateur.

## 🚀 Installation

### 1. Installer Swag (générateur de documentation)

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

### 2. Générer la documentation

Depuis le dossier `backend` :

**Windows (PowerShell):**
```powershell
.\generate-swagger.ps1
```

**Linux/Mac:**
```bash
swag init -g main.go -o ./docs --parseDependency --parseInternal
```

### 3. Démarrer le serveur

```bash
go run main.go
```

## 🌐 Accéder à la documentation

Une fois le serveur démarré, accédez à :
- **Interface Swagger UI**: http://localhost:8080/swagger/index.html
- **Documentation JSON**: http://localhost:8080/swagger/doc.json

## 🔑 Utilisation

### Tester les endpoints protégés

1. **S'authentifier** :
   - Aller dans la section "Authentication"
   - Utiliser `/auth/register` ou `/auth/login`
   - Copier le token retourné

2. **Autoriser les requêtes** :
   - Cliquer sur le bouton **"Authorize"** (cadenas) en haut à droite
   - Entrer : `Bearer <votre-token>`
   - Cliquer sur "Authorize"

3. **Tester les endpoints** :
   - Tous les endpoints sont maintenant testables directement depuis Swagger UI
   - Vous pouvez modifier les paramètres, voir les réponses, et tester les erreurs

## 📋 Endpoints documentés

### 🔐 Authentication
- `POST /auth/register` - Inscription (public)
- `POST /auth/login` - Connexion (public)
- `GET /auth/me` - Informations utilisateur connecté (authentifié)

### 👥 Users
- `POST /users` - Créer un utilisateur (public)
- `GET /users` - Liste tous les utilisateurs (public)
- `GET /user/{id}` - Détails utilisateur (public)
- `PUT /user/{id}` - Mettre à jour un utilisateur (public)
- `DELETE /user/{id}` - Supprimer un utilisateur (public)

### 🛍️ Products
- `GET /products` - Liste tous les produits (public)
- `GET /products/{id}` - Détails produit (public)
- `POST /admin/products` - Créer un produit (Admin)
- `PUT /admin/products/{id}` - Mettre à jour un produit (Admin)
- `DELETE /admin/products/{id}` - Supprimer un produit (Admin)

### 📂 Categories
- `GET /admin/categories` - Liste toutes les catégories (Admin)
- `GET /admin/categories/{id}` - Détails catégorie (Admin)
- `POST /admin/categories` - Créer une catégorie (Admin)
- `PUT /admin/categories/{id}` - Mettre à jour une catégorie (Admin)
- `DELETE /admin/categories/{id}` - Supprimer une catégorie (Admin)

### 📦 Orders
- `POST /orders` - Créer une commande (Authentifié)
- `GET /orders` - Mes commandes (Authentifié)
- `GET /orders/{id}` - Détails commande (Authentifié - propriétaire ou Admin)
- `GET /admin/orders` - Toutes les commandes (Admin)
- `PUT /admin/orders/{id}/status` - Mettre à jour le statut (Admin)

## 🔄 Régénérer la documentation

Après avoir modifié les annotations Swagger dans les handlers, régénérez la documentation :

```powershell
.\generate-swagger.ps1
```

ou

```bash
swag init -g main.go -o ./docs --parseDependency --parseInternal
```

## 📝 Notes importantes

- La documentation est générée automatiquement à partir des annotations dans les handlers
- Les exemples de réponses sont basés sur les DTOs définis
- Tous les endpoints nécessitant une authentification sont marqués avec `@Security BearerAuth`
- Les rôles requis (Admin) sont indiqués dans les descriptions

## 🐛 Dépannage

Si la génération échoue :
1. Vérifiez que tous les imports sont corrects
2. Vérifiez que les annotations Swagger sont bien formatées
3. Assurez-vous que le fichier `main.go` contient les annotations de base
4. Vérifiez que les DTOs sont correctement importés dans les handlers

