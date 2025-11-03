// internal/handlers/users.go
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"api/internal/db"
	"api/internal/docs"
	"api/internal/dtos"
	"api/internal/services"
	"api/internal/utils"
)

// Utilisation des types docs pour Swagger
var _ = docs.ErrorResponse{}

// CreateUser handler pour POST /users
// @Summary      Créer un utilisateur
// @Description  Crée un nouvel utilisateur (sans authentification requise)
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        request  body      dtos.UserRequest  true  "Informations utilisateur"
// @Success      201      {object}  dtos.UserResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      409      {object}  docs.ErrorResponse  "Email déjà utilisé"
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /users [post]
func CreateUser(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req dtos.UserRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		if req.Email == "" || req.Password == "" {
			utils.RespondError(w, http.StatusBadRequest, "Email et mot de passe sont requis")
			return
		}

		user, err := services.CreateUser(client, req.Email, req.Password)
		if err != nil {
			if err.Error() == "L'email existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la création")
			return
		}

		// Convertir en DTO sans password
		response := dtos.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		}
		utils.RespondJSON(w, http.StatusCreated, response)
	}
}

// GetUserHandler Handler pour GET /user/{id}
// @Summary      Récupérer un utilisateur
// @Description  Récupère les informations d'un utilisateur par son ID
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID de l'utilisateur"
// @Success      200  {object}  dtos.UserResponse
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /user/{id} [get]
func GetUserHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		user, err := services.GetUserByID(client, userID)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur interne")
			return
		}
		if user == nil {
			utils.RespondError(w, http.StatusNotFound, "Utilisateur non trouvé")
			return
		}

		// Convertir en DTO sans password
		response := dtos.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		}
		utils.RespondJSON(w, http.StatusOK, response)
	}
}

// GetAllUsersHandler Handler pour GET /users
// @Summary      Liste tous les utilisateurs
// @Description  Récupère la liste de tous les utilisateurs
// @Tags         Users
// @Accept       json
// @Produce      json
// @Success      200  {array}   dtos.UserResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /users [get]
func GetAllUsersHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users, err := services.GetAllUsers(client)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur interne")
			return
		}

		// Convertir en DTOs sans password
		response := make([]dtos.UserResponse, len(users))
		for i, user := range users {
			response[i] = dtos.UserResponse{
				ID:        user.ID,
				Email:     user.Email,
				Role:      user.Role,
				CreatedAt: user.CreatedAt,
				UpdatedAt: user.UpdatedAt,
			}
		}
		utils.RespondJSON(w, http.StatusOK, response)
	}
}

// UpdateUserHandler Handler pour PUT /user/{id}
// @Summary      Mettre à jour un utilisateur
// @Description  Met à jour les informations d'un utilisateur
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        id       path      string             true  "ID de l'utilisateur"
// @Param        request  body      dtos.UserRequest  true  "Nouvelles informations"
// @Success      200      {object}  dtos.UserResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /user/{id} [put]
func UpdateUserHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := chi.URLParam(r, "id")
		var req dtos.UserRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		if req.Email == "" || req.Password == "" {
			utils.RespondError(w, http.StatusBadRequest, "Email et mot de passe sont requis")
			return
		}

		user, err := services.UpdateUser(client, userID, req.Email, req.Password)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la mise à jour")
			return
		}

		// Convertir en DTO sans password
		response := dtos.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		}
		utils.RespondJSON(w, http.StatusOK, response)
	}
}

// DeleteUserHandler Handler pour DELETE /user/{id}
// @Summary      Supprimer un utilisateur
// @Description  Supprime un utilisateur par son ID
// @Tags         Users
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "ID de l'utilisateur"
// @Success      204  "No Content"
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /user/{id} [delete]
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
