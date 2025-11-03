// internal/handlers/users.go
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"api/internal/db"
	"api/internal/models"
	"api/internal/services"
)

// handler pour POST /users
func CreateUser(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req models.UserRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "JSON invalide", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.Password == "" {
			http.Error(w, "Champs vides", http.StatusBadRequest)
			return
		}
		u, err := services.CreateUser(client, req.Email, req.Password)
		if err != nil {
			http.Error(w, "Erreur interne", http.StatusInternalServerError)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("content-Type", "application/json")
		json.NewEncoder(w).Encode(u)
	}
}

// Handler pour GET /user/{id}
func GetUserHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		u, err := services.GetUserByID(client, userID)
		if err != nil {
			http.Error(w, "Erreur interne", http.StatusInternalServerError)
			return
		}
		if u == nil {
			http.Error(w, "Utilisateur non trouvé", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(u)
	}
}

// Handler pour GET /users
func GetAllUsersHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := services.GetAllUsers(client)

		if err != nil {
			http.Error(w, "Erreur interne", http.StatusInternalServerError)
			return
		}
		if users == nil {
			http.Error(w, "Utilisateurs non trouvé", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}

// Handler pour PUT /user/{id}
func UpdateUserHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		var req models.UserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "JSON invalide", http.StatusBadRequest)
			return
		}
		user, err := services.UpdateUser(client, userID, req.Email, req.Password)
		if err != nil {
			http.Error(w, "Erreur update", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

// Handler pour DELETE /user/{id}
func DeleteUserHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		if err := services.DeleteUser(client, userID); err != nil {
			http.Error(w, "Erreur interne", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
