// main.go
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"api/internal/db"
	"api/internal/routes"
)

func main() {
	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatal("Erreur de connexion Prisma: ", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Enregistrez les routes liées aux utilisateurs
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
