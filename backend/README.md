# PORELO Skincare Shop API

API REST écrite en Go pour gérer une boutique de soins de la peau (skincare). Elle expose des endpoints sécurisés pour gérer les produits, catégories, avis et commandes tout en supportant différents rôles utilisateurs (clients et administrateurs).

## Pourquoi cette pile technique ?
- **Performance native** : Go compile en binaire, démarre vite, gère facilement la concurrence (goroutines et scheduler) sans dépendre d’un runtime JS + interprète → mieux adapté aux montées en charge qu’un serveur Node standard (même avec Nest/Express) sans recourir à des workers externes.
- **Maintenance** : langage typé statiquement, linters/formatters intégrés (`go fmt`, `go test`, `go vet`), tooling homogène → moins de dépendances et d’étapes de build qu’un projet Node où TypeScript, ts-node, Babel, etc. doivent être alignés.
- **Dev Experience backend** : Chi offre une approche minimaliste mais puissante, Prisma Client Go garde une syntaxe proche de l’écosystème Prisma côté Node → on garde la productivité d’un ORM moderne tout en profitant du langage Go.
- **Sécurité & déploiement** : un seul binaire → conteneurs ultra légers, surface d’attaque réduite (pas de Node/npm sur la cible), M2M simple (JWT natif, libs standard).
- **Équipe / cas d’usage** : API B2C à terme orientée performances (catalogue, commandes, avis). Go est déjà maîtrisé côté backend, le front est séparé (`porelo-front`) → pas besoin de framework tout-en-un comme Nest. Express aurait requis plus de kits maison (structuration, validation, découpages) là où la hiérarchie interne Go (`handlers` / `services` / `routes`) est claire.
- **Prisma Client Go + PostgreSQL** : génération d’un client typesafe, migrations versionnées et base relationnelle solide pour les relations produits/commandes/avis.
- **JWT + bcrypt** : authentification stateless, sécurisation des mots de passe, facilement consommable par des clients web/mobile.
- **Swagger / OpenAPI** : documentation auto-générée, partageable, avec interface d’essai en live.
- **Outil de rechargement (`fresh`)** : pendant Go de `nodemon`, relance automatique pendant le dev.

## Vue d’ensemble de l’architecture
```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Client Web   │──────▶│ Router Chi   │──────▶│ Middlewares  │
└──────────────┘       └──────────────┘       └───────▲──────┘
                                                      │
                                               JWT / Roles
                                                      │
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Handlers HTTP│──────▶│ Services     │──────▶│ Prisma Client│
└──────────────┘       └──────────────┘       └───────▲──────┘
                                                      │
                                                PostgreSQL
```

### Parcours d’une requête
1. **Route Chi** (`internal/routes`) : associe un endpoint HTTP à un handler spécifique.
2. **Middlewares** (`internal/middlewares`) : ajout de contextes (logs, CORS, auth JWT, contrôle du rôle `ADMIN`).
3. **Handlers** (`internal/handlers`) : gèrent la partie HTTP (lecture JSON, validation minimale, code de statut, formatage de réponse).
4. **Services métier** (`internal/services`) : encapsulent la logique fonctionnelle (vérifications, agrégations, règles produits/commandes).
5. **Client Prisma** (`internal/db`) : exécute les requêtes SQL via des méthodes générées automatiquement et typesafe.
6. **Base PostgreSQL** : persiste les utilisateurs, produits, commandes et avis.

## Fonctionnalités clés
- Authentification JWT (inscription, login, profil) et rôles `USER` / `ADMIN`.
- Gestion catalogue : produits paginés, catégories, galerie d’images.
- Workflow commande : création, statut (`PENDING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), calcul du total.
- Avis produits : note 1-5, unicité par couple utilisateur/produit.
- Documentation ricaine via Swagger et compte admin de démonstration (`momo@ynov.com` / `Password2025`).

## Structure du projet (fichiers & rôles)
📦backend
 ┣ 📂docs
 ┃ ┣ 📜chapitre0.html
 ┃ ┣ 📜chapitre1.html
 ┃ ┣ 📜docs.go
 ┃ ┣ 📜init.html
 ┃ ┣ 📜swagger.json
 ┃ ┣ 📜swagger.yaml
 ┃ ┗ 📜tuto.html
 ┣ 📂images
 ┣ 📂internal
 ┃ ┣ 📂db
 ┃ ┃ ┣ 📜.gitignore
 ┃ ┃ ┣ 📜db_gen.go
 ┃ ┃ ┗ 📜query-engine-windows_gen.go
 ┃ ┣ 📂docs
 ┃ ┃ ┗ 📜swagger.go
 ┃ ┣ 📂dtos
 ┃ ┃ ┣ 📜category_dto.go
 ┃ ┃ ┣ 📜order_dto.go
 ┃ ┃ ┣ 📜product_dto.go
 ┃ ┃ ┣ 📜review_dto.go
 ┃ ┃ ┗ 📜user_dto.go
 ┃ ┣ 📂handlers
 ┃ ┃ ┣ 📜auth.go
 ┃ ┃ ┣ 📜category.go
 ┃ ┃ ┣ 📜order.go
 ┃ ┃ ┣ 📜product.go
 ┃ ┃ ┣ 📜review.go
 ┃ ┃ ┗ 📜users.go
 ┃ ┣ 📂middlewares
 ┃ ┃ ┣ 📜auth_middleware.go
 ┃ ┃ ┗ 📜role_middleware.go
 ┃ ┣ 📂models
 ┃ ┃ ┗ 📜users.go
 ┃ ┣ 📂routes
 ┃ ┃ ┣ 📜auth.go
 ┃ ┃ ┣ 📜category.go
 ┃ ┃ ┣ 📜order.go
 ┃ ┃ ┣ 📜product.go
 ┃ ┃ ┣ 📜review.go
 ┃ ┃ ┗ 📜users.go
 ┃ ┣ 📂services
 ┃ ┃ ┣ 📜auth_service.go
 ┃ ┃ ┣ 📜category_service.go
 ┃ ┃ ┣ 📜order_service.go
 ┃ ┃ ┣ 📜product_service.go
 ┃ ┃ ┣ 📜review_service.go
 ┃ ┃ ┗ 📜user_service.go
 ┃ ┗ 📂utils
 ┃ ┃ ┣ 📜jwt.go
 ┃ ┃ ┗ 📜user.go
 ┣ 📂prisma
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂20251028120209_add_product
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┃ ┣ 📂20251103001113_add_category
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┃ ┣ 📂20251104160201_add_review_model
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┃ ┗ 📜migration_lock.toml
 ┃ ┗ 📜schema.prisma
 ┣ 📂scripts
 ┃ ┣ 📜fix-swagger-order.ps1
 ┃ ┣ 📜README.md
 ┃ ┗ 📜seed.go
 ┣ 📂tmp
 ┃ ┣ 📜runner-build-errors.log
 ┃ ┣ 📜runner-build.exe
 ┃ ┗ 📜runner-build.exe~
 ┣ 📜.env
 ┣ 📜.env.example
 ┣ 📜.gitignore
 ┣ 📜COMMITS_GUIDE.md
 ┣ 📜go.mod
 ┣ 📜go.sum
 ┣ 📜main.go
 ┣ 📜README.md
 ┣ 📜SETUP.md
 ┣ 📜SWAGGER_SETUP.md
 ┗ 📜test-build.exe








 
- `main.go` : point d’entrée, initialisation du client Prisma, middlewares globaux, montage des routes et lancement HTTP.
- `go.mod / go.sum` : module Go, dépendances (Chi, Prisma, JWT, Swagger, bcrypt via `golang.org/x/crypto`).
- `internal/db` : code généré par Prisma (`PrismaClient`). À ne pas éditer manuellement.
- `internal/routes`
  - `auth.go`, `product.go`, `category.go`, `order.go`, `review.go`, `users.go` : regroupent les endpoints par domaine et branchent les middlewares nécessaires.
- `internal/middlewares`
  - `auth_middleware.go` : extrait le JWT, valide les claims et attache l’utilisateur au contexte.
  - `role_middleware.go` : vérifie que le rôle courant correspond à `ADMIN` pour les routes protégées.
- `internal/handlers`
  - `auth.go` : handlers Register/Login/Me, conversion des paramètres HTTP vers DTOs.
  - Autres fichiers (`product.go`, `order.go`, etc.) : validation des inputs, appel des services, gestion des codes de retour.
- `internal/services`
  - Contient la logique métier réutilisable (ex. `CreateProduct` vérifie l’unicité du nom, `UpdateOrderStatus` applique les règles de statut).
- `internal/dtos`
  - Structures de requêtes/réponses (ex. `ProductRequest`, `PaginatedProductsResponse`) pour découpler l’API des modèles Prisma.
- `internal/utils`
  - `jwt.go` : génération/validation de tokens.
  - `user.go` : helpers (hash, comparaison mot de passe, réponses JSON standardisées, masquage d’email).
- `internal/models`
  - Types maison ou helpers complémentaires si besoin (ex. `users.go`).
- `internal/docs`
  - `swagger.go` : métadonnées Swagger générées automatiquement.
- `prisma/schema.prisma` : définition des modèles (User, Product, Category, Order, Review) et enums (`Role`, `OrderStatus`).
- `prisma/migrations` : historique SQL des évolutions de schéma.
- `scripts/seed.go` : création d’un jeu de données d’exemple (admin, catégories, produits).
- `scripts/fix-swagger-order.ps1` : script PowerShell pour remettre l’ordre des tags dans la doc Swagger.
- `docs/` : ressources complémentaires (ex. `SWAGGER_SETUP.md` pour régénérer la doc).
- `tmp/`, `images/` : assets ou artefacts temporaires (ex. binaire `test-build.exe`).

## Mise en route rapide
1. **Prérequis** : Go >= 1.25, PostgreSQL, Prisma CLI (`go install github.com/steebchen/prisma-client-go@latest`).
2. **Variables d'environnement** (`.env` à la racine du backend) :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/porelo"
   JWT_SECRET="change-me"
   PORT="8080"
   
   # Optionnel : Durées d'expiration des tokens
   ACCESS_TOKEN_EXPIRATION_MINUTES=15      # Défaut: 15 minutes
   REFRESH_TOKEN_EXPIRATION_HOURS=168     # Défaut: 168 heures (7 jours)
   ```
   
   Voir `docs/ENV_VARIABLES.md` pour la documentation complète des variables d'environnement.
3. **Migrations & génération du client Prisma** :
   ```bash
   go run github.com/steebchen/prisma-client-go migrate dev
   go run github.com/steebchen/prisma-client-go generate
   ```
4. **Seeder optionnel** :
   ```bash
   go run scripts/seed.go
   ```
5. **Lancement de l’API** :
   ```bash
   fresh
   ```
   (`fresh` – le pendant Go de `nodemon` – pour redémarrer automatiquement le serveur.)

L’API écoute par défaut sur `http://localhost:8080`. La documentation interactive est disponible sur `http://localhost:8080/swagger/index.html`.

## Sécurité & bonnes pratiques
- Hash des mots de passe via `bcrypt` et stockage uniquement en base.
- Tokens JWT signés HS256, rotation facile via variable d’environnement `JWT_SECRET`.
- Middleware de rôle pour isoler les routes `/admin/*`.
- CORS ouvert pour le développement (`AllowedOrigins: *`) à resserrer en production.
- Gestion des erreurs uniformisée (`utils.RespondError`) pour des réponses cohérentes côté client.


---
