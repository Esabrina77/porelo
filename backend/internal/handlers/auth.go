package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"api/internal/db"
	"api/internal/docs"
	"api/internal/dtos"
	"api/internal/middlewares"
	"api/internal/services"
	"api/internal/utils"
)

// Utilisation des types docs pour éviter les erreurs de compilation
var _ = docs.ErrorResponse{}

// RegisterHandler gère l'inscription d'un nouvel utilisateur
// @Summary      Inscription d'un nouvel utilisateur
// @Description  Crée un nouveau compte utilisateur et retourne un token JWT
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request  body      dtos.UserRequest  true  "Informations d'inscription"
// @Success      201      {object}  dtos.LoginResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      409      {object}  docs.ErrorResponse  "Email déjà utilisé"
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /auth/register [post]
func RegisterHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req dtos.UserRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Email == "" || req.Password == "" {
			utils.RespondError(w, http.StatusBadRequest, "Email et mot de passe sont requis")
			return
		}

		if len(req.Password) < 6 {
			utils.RespondError(w, http.StatusBadRequest, "Le mot de passe doit contenir au moins 6 caractères")
			return
		}

		// Créer l'utilisateur et obtenir le token
		response, err := services.Register(client, req.Email, req.Password)
		if err != nil {
			if err.Error() == "l'email existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			// Log l'erreur pour le débogage
			log.Printf("Erreur lors de l'inscription: %v", err)
			utils.RespondError(w, http.StatusInternalServerError, fmt.Sprintf("Erreur lors de l'inscription: %v", err))
			return
		}

		utils.RespondJSON(w, http.StatusCreated, response)
	}
}

// LoginHandler gère la connexion d'un utilisateur
// @Summary      Connexion utilisateur
// @Description  Authentifie un utilisateur et retourne un token JWT
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request  body      dtos.LoginRequest  true  "Identifiants de connexion"
// @Success      200      {object}  dtos.LoginResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse  "Email ou mot de passe incorrect"
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /auth/login [post]
func LoginHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req dtos.LoginRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Email == "" || req.Password == "" {
			utils.RespondError(w, http.StatusBadRequest, "Email et mot de passe sont requis")
			return
		}

		// Authentifier l'utilisateur et obtenir le token
		response, err := services.Login(client, req.Email, req.Password)
		if err != nil {
			if err.Error() == "email ou mot de passe incorrect" {
				utils.RespondError(w, http.StatusUnauthorized, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la connexion")
			return
		}

		utils.RespondJSON(w, http.StatusOK, response)
	}
}

// MeHandler retourne les informations de l'utilisateur actuellement connecté
// @Summary      Informations utilisateur actuel
// @Description  Récupère les informations de l'utilisateur connecté via le token JWT
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dtos.UserResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      404  {object}  docs.ErrorResponse
// @Router       /auth/me [get]
func MeHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer les claims depuis le contexte (nécessite AuthMiddleware)
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}

		// Récupérer les informations complètes de l'utilisateur
		user, err := services.GetCurrentUser(client, claims.UserID)
		if err != nil {
			utils.RespondError(w, http.StatusNotFound, "Utilisateur non trouvé")
			return
		}

		utils.RespondJSON(w, http.StatusOK, user)
	}
}
