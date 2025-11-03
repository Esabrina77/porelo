package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// RegisterProductRoutes enregistre les routes des produits
func RegisterProductRoutes(r chi.Router, client *db.PrismaClient) {
	// Routes protégées (nécessitent authentification - USER ou ADMIN)
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Get("/products", handlers.GetAllProductsHandler(client))
		r.Get("/products/{id}", handlers.GetProductHandler(client))
	})

	// Routes protégées (nécessitent authentification + rôle ADMIN)
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Use(middlewares.RequireRole("ADMIN"))
		r.Post("/admin/products", handlers.CreateProductHandler(client))
		r.Put("/admin/products/{id}", handlers.UpdateProductHandler(client))
		r.Delete("/admin/products/{id}", handlers.DeleteProductHandler(client))
	})
}
