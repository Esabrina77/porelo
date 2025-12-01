// main.go
// @title           PORELO Skincare Shop API
// @version         1.0
// @description     API REST complète pour une boutique de produits de soins (skincare shop) avec authentification JWT et gestion des rôles.
// @description     Cette API permet de gérer les produits, catégories, commandes et utilisateurs.
// @description
// @description     ## Authentification
// @description     La plupart des endpoints nécessitent une authentification JWT. Pour tester les endpoints protégés :
// @description
// @description     **Étape 1 : Obtenir un token**
// @description     1. Utilisez `/auth/register` pour créer un compte OU `/auth/login` pour vous connecter
// @description     2. Copiez le token JWT retourné dans la réponse (champ "token")
// @description
// @description     **Étape 2 : Autoriser les requêtes dans Swagger UI**
// @description     1. Cliquez sur le bouton **"Authorize"** (icône de cadenas) en haut à droite de cette page
// @description     2. Dans le champ "Value", entrez : `Bearer <votre-token>` (remplacez `<votre-token>` par le token copié)
// @description     3. Cliquez sur **"Authorize"** puis **"Close"**
// @description
// @description     **Étape 3 : Tester les endpoints**
// @description     Tous les endpoints protégés sont maintenant accessibles. Vous pouvez cliquer sur "Try it out" et tester chaque endpoint.
// @description
// @description     ## Rôles
// @description     - **USER** : Peut voir les produits, créer des commandes, voir ses propres commandes
// @description     - **ADMIN** : Accès complet à toutes les ressources
// @description
// @description     ---
// @description
// @description     ## 🔐 Compte de test Admin
// @description
// @description     **Email:** `momo@ynov.com`
// @description     **Password:** `Password2025`
// @description
// @description     Utilisez ce compte pour tester toutes les fonctionnalités admin dans l'API.
// @host            localhost:8080
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description     Type "Bearer" suivi d'un espace et du token JWT. Exemple: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
//
// @tag.name Authentication
// @tag.description Endpoints d'authentification (inscription, connexion, profil)
// @tag.order 1
//
// @tag.name Products
// @tag.description Gestion des produits de soins
// @tag.order 2
//
// @tag.name Orders
// @tag.description Gestion des commandes
// @tag.order 3
//
// @tag.name Categories
// @tag.description Gestion des catégories de produits
// @tag.order 4
//
// @tag.name Users
// @tag.description Gestion des utilisateurs
// @tag.order 5
package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"

	_ "api/docs"            // Documentation Swagger générée - nécessaire pour initialiser SwaggerInfo
	_ "api/internal/config" // Charge automatiquement le .env via init()
	"api/internal/db"
	"api/internal/middlewares"
	"api/internal/routes"
)

func main() {

	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatal("Erreur de connexion Prisma: ", err)
	}

	r := chi.NewRouter()

	// Middleware de base
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Rate limiting global : 100 requêtes par minute par IP
	r.Use(middlewares.RateLimitMiddleware(100, time.Minute))

	// Configuration CORS pour permettre les requêtes depuis le frontend et mobile
	r.Use(cors.Handler(cors.Options{
		// Origines autorisées :
		// - Frontend web (Nuxt, React, etc.)
		// - React Native : "*" car les apps natives n'ont pas d'origine web classique
		AllowedOrigins:   []string{"*"}, // Pour développement : accepte toutes les origines. En production, spécifiez vos domaines exacts
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Durée de cache pour les pré-requêtes OPTIONS (en secondes)
	}))

	// Route Swagger pour la documentation
	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.DeepLinking(true),
		httpSwagger.DocExpansion("list"),
	))
	// //sur "/", evonyer "bonjour" sur la page
	// r.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	w.Write([]byte("bonjour"))
	// })

	// Versioning API : toutes les routes sous /api/v1
	r.Route("/api/v1", func(r chi.Router) {
		// Routes d'authentification (publiques)
		routes.RegisterAuthRoutes(r, client)

		// Routes des avis (gestion interne de l'auth selon les endpoints)
		r.Mount("/", routes.ReviewRoutes(client))

		// Routes protégées nécessitant authentification
		r.Group(func(r chi.Router) {
			r.Use(middlewares.AuthMiddleware)
			routes.RegisterProductRoutes(r, client)
			routes.RegisterCategoryRoutes(r, client)
			routes.RegisterOrderRoutes(r, client)
			routes.RegisterUserRoutes(r, client)
		})
	})

	// Routes sans versioning (pour compatibilité avec l'existant)
	// TODO: À supprimer progressivement une fois que le frontend utilise /api/v1
	routes.RegisterAuthRoutes(r, client)
	routes.RegisterProductRoutes(r, client)
	routes.RegisterCategoryRoutes(r, client)
	routes.RegisterOrderRoutes(r, client)
	r.Mount("/", routes.ReviewRoutes(client))
	routes.RegisterUserRoutes(r, client)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("Listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal(err)
	}
}
