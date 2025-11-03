package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// RegisterCategoryRoutes enregistre les routes des catégories (admin only)
func RegisterCategoryRoutes(r chi.Router, client *db.PrismaClient) {
	// Toutes les routes nécessitent authentification + rôle ADMIN
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Use(middlewares.RequireRole("ADMIN"))
		r.Get("/admin/categories", handlers.GetAllCategoriesHandler(client))
		r.Get("/admin/categories/{id}", handlers.GetCategoryHandler(client))
		r.Post("/admin/categories", handlers.CreateCategoryHandler(client))
		r.Put("/admin/categories/{id}", handlers.UpdateCategoryHandler(client))
		r.Delete("/admin/categories/{id}", handlers.DeleteCategoryHandler(client))
	})
}
