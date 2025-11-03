package routes

import (
	"api/internal/db"
	"api/internal/handlers"
	"api/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

// RegisterOrderRoutes enregistre les routes des commandes
func RegisterOrderRoutes(r chi.Router, client *db.PrismaClient) {
	// Routes pour utilisateurs authentifiés
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Post("/orders", handlers.CreateOrderHandler(client))
		r.Get("/orders", handlers.GetUserOrdersHandler(client))
		r.Get("/orders/{id}", handlers.GetOrderHandler(client))
	})

	// Routes admin
	r.Group(func(r chi.Router) {
		r.Use(middlewares.AuthMiddleware)
		r.Use(middlewares.RequireRole("ADMIN"))
		r.Get("/admin/orders", handlers.GetAllOrdersHandler(client))
		r.Put("/admin/orders/{id}/status", handlers.UpdateOrderStatusHandler(client))
	})
}
