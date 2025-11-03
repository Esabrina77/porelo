package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// RegisterAuthRoutes enregistre les routes d'authentification
func RegisterAuthRoutes(r chi.Router, client *db.PrismaClient) {
	// Routes publiques (pas d'authentification requise)
	r.Post("/auth/register", handlers.RegisterHandler(client))
	r.Post("/auth/login", handlers.LoginHandler(client))

	// Routes protégées (nécessitent une authentification)
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Get("/auth/me", handlers.MeHandler(client))
	})
}
