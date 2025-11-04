// internal/routes/users.go
package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// Définition des routes liées aux utilisateurs
func RegisterUserRoutes(r chi.Router, client *db.PrismaClient) {
	// Route publique : création d'utilisateur (peut être utilisée pour l'inscription alternative)
	// Note: Normalement l'inscription se fait via /auth/register
	r.Post("/users", handlers.CreateUser(client))

	// Routes authentifiées : utilisateur peut voir/modifier son propre profil
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Get("/user/{id}", handlers.GetUserHandler(client))
		r.Put("/user/{id}", handlers.UpdateUserHandler(client))
	})

	// Routes admin uniquement : gestion de tous les utilisateurs
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Use(middlewares.RequireRole("ADMIN"))
		r.Get("/admin/users", handlers.GetAllUsersHandler(client))
		r.Delete("/admin/user/{id}", handlers.DeleteUserHandler(client))
	})
}
