package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// ReviewRoutes configure les routes pour les avis
func ReviewRoutes(client *db.PrismaClient) chi.Router {
	r := chi.NewRouter()

	// Routes authentifiées pour les avis
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)

		// Créer un avis pour un produit
		r.Post("/products/{productID}/reviews", handlers.CreateReviewHandler(client))

		// Récupérer l'avis de l'utilisateur connecté pour un produit
		r.Get("/products/{productID}/reviews/me", handlers.GetUserReviewHandler(client))

		// Mettre à jour un avis
		r.Put("/reviews/{reviewID}", handlers.UpdateReviewHandler(client))

		// Supprimer un avis
		r.Delete("/reviews/{reviewID}", handlers.DeleteReviewHandler(client))
	})

	// Route publique pour récupérer tous les avis d'un produit (authentifiée)
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Get("/products/{productID}/reviews", handlers.GetProductReviewsHandler(client))
	})

	return r
}
