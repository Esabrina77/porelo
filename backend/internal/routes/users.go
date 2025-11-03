// internal/routes/users.go
package routes

import (
	"api/internal/db"
	"api/internal/handlers"

	"github.com/go-chi/chi/v5"
)

// Définition des routes liées aux utilisateurs
func RegisterUserRoutes(r chi.Router, client *db.PrismaClient) {
	r.Post("/users", handlers.CreateUser(client))
	r.Get("/user/{id}", handlers.GetUserHandler(client))
	r.Get("/users", handlers.GetAllUsersHandler(client))
	r.Put("/user/{id}", handlers.UpdateUserHandler(client))
	r.Delete("/user/{id}", handlers.DeleteUserHandler(client))
}
