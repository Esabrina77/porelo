package handlers

import (
	"encoding/json"
	"net/http"

	"api/internal/db"
	"api/internal/docs"
	"api/internal/dtos"
	"api/internal/middlewares"
	"api/internal/services"
	"api/internal/utils"

	"github.com/go-chi/chi/v5"
)

// Utilisation des types docs pour Swagger
var _ = docs.ErrorResponse{}

// CreateReviewHandler gère la création d'un avis (authentifié)
// @Summary      Créer un avis pour un produit
// @Description  Permet à un utilisateur authentifié de laisser un avis (note et commentaire) sur un produit
// @Tags         Reviews
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dtos.CreateReviewRequest  true  "Données de l'avis"
// @Success      201      {object}  dtos.ReviewResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      404      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /products/{productID}/reviews [post]
func CreateReviewHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer l'utilisateur depuis le contexte (ajouté par AuthMiddleware)
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}
		userID := claims.UserID

		productID := chi.URLParam(r, "productID")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		var req dtos.CreateReviewRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "Données invalides")
			return
		}

		// S'assurer que le productID correspond
		req.ProductID = productID

		// Valider la note (1-5)
		if req.Rating < 1 || req.Rating > 5 {
			utils.RespondError(w, http.StatusBadRequest, "La note doit être entre 1 et 5")
			return
		}

		review, err := services.CreateReview(client, userID, req)
		if err != nil {
			if err.Error() == "produit non trouvé" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
			} else {
				utils.RespondError(w, http.StatusInternalServerError, err.Error())
			}
			return
		}

		utils.RespondJSON(w, http.StatusCreated, review)
	}
}

// GetProductReviewsHandler gère la récupération des avis d'un produit (authentifié)
// @Summary      Liste des avis d'un produit
// @Description  Récupère tous les avis d'un produit avec statistiques (moyenne, total)
// @Tags         Reviews
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        productID  path      string  true  "ID du produit"
// @Success      200        {object}  dtos.ProductReviewsResponse
// @Failure      400        {object}  docs.ErrorResponse
// @Failure      401        {object}  docs.ErrorResponse
// @Failure      404        {object}  docs.ErrorResponse
// @Failure      500        {object}  docs.ErrorResponse
// @Router       /products/{productID}/reviews [get]
func GetProductReviewsHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		productID := chi.URLParam(r, "productID")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		reviews, err := services.GetProductReviews(client, productID)
		if err != nil {
			if err.Error() == "produit non trouvé" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
			} else {
				utils.RespondError(w, http.StatusInternalServerError, err.Error())
			}
			return
		}

		utils.RespondJSON(w, http.StatusOK, reviews)
	}
}

// GetUserReviewHandler gère la récupération de l'avis d'un utilisateur pour un produit (authentifié)
// @Summary      Avis de l'utilisateur pour un produit
// @Description  Récupère l'avis de l'utilisateur connecté pour un produit spécifique
// @Tags         Reviews
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        productID  path      string  true  "ID du produit"
// @Success      200        {object}  dtos.ReviewResponse
// @Success      404        "Aucun avis trouvé"
// @Failure      400        {object}  docs.ErrorResponse
// @Failure      401        {object}  docs.ErrorResponse
// @Failure      500        {object}  docs.ErrorResponse
// @Router       /products/{productID}/reviews/me [get]
func GetUserReviewHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer l'utilisateur depuis le contexte
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}
		userID := claims.UserID

		productID := chi.URLParam(r, "productID")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		review, err := services.GetUserReview(client, userID, productID)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if review == nil {
			utils.RespondJSON(w, http.StatusNotFound, nil)
			return
		}

		utils.RespondJSON(w, http.StatusOK, review)
	}
}

// UpdateReviewHandler gère la mise à jour d'un avis (authentifié)
// @Summary      Mettre à jour un avis
// @Description  Permet à un utilisateur de modifier son propre avis
// @Tags         Reviews
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        reviewID  path      string                true  "ID de l'avis"
// @Param        request   body      dtos.UpdateReviewRequest  true  "Données de mise à jour"
// @Success      200       {object}  dtos.ReviewResponse
// @Failure      400       {object}  docs.ErrorResponse
// @Failure      401       {object}  docs.ErrorResponse
// @Failure      403       {object}  docs.ErrorResponse
// @Failure      404       {object}  docs.ErrorResponse
// @Failure      500       {object}  docs.ErrorResponse
// @Router       /reviews/{reviewID} [put]
func UpdateReviewHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer l'utilisateur depuis le contexte
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}
		userID := claims.UserID

		reviewID := chi.URLParam(r, "reviewID")
		if reviewID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID d'avis requis")
			return
		}

		var req dtos.UpdateReviewRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "Données invalides")
			return
		}

		// Valider la note si fournie
		if req.Rating != nil && (*req.Rating < 1 || *req.Rating > 5) {
			utils.RespondError(w, http.StatusBadRequest, "La note doit être entre 1 et 5")
			return
		}

		review, err := services.UpdateReview(client, reviewID, userID, req)
		if err != nil {
			if err.Error() == "avis non trouvé" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
			} else if err.Error() == "vous n'êtes pas autorisé à modifier cet avis" {
				utils.RespondError(w, http.StatusForbidden, err.Error())
			} else {
				utils.RespondError(w, http.StatusInternalServerError, err.Error())
			}
			return
		}

		utils.RespondJSON(w, http.StatusOK, review)
	}
}

// DeleteReviewHandler gère la suppression d'un avis (authentifié)
// @Summary      Supprimer un avis
// @Description  Permet à un utilisateur de supprimer son propre avis
// @Tags         Reviews
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        reviewID  path      string  true  "ID de l'avis"
// @Success      200       {object}  docs.SuccessMessage
// @Failure      400       {object}  docs.ErrorResponse
// @Failure      401       {object}  docs.ErrorResponse
// @Failure      403       {object}  docs.ErrorResponse
// @Failure      404       {object}  docs.ErrorResponse
// @Failure      500       {object}  docs.ErrorResponse
// @Router       /reviews/{reviewID} [delete]
func DeleteReviewHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer l'utilisateur depuis le contexte
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}
		userID := claims.UserID

		reviewID := chi.URLParam(r, "reviewID")
		if reviewID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID d'avis requis")
			return
		}

		err := services.DeleteReview(client, reviewID, userID)
		if err != nil {
			if err.Error() == "avis non trouvé" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
			} else if err.Error() == "vous n'êtes pas autorisé à supprimer cet avis" {
				utils.RespondError(w, http.StatusForbidden, err.Error())
			} else {
				utils.RespondError(w, http.StatusInternalServerError, err.Error())
			}
			return
		}

		utils.RespondJSON(w, http.StatusOK, map[string]string{"message": "Avis supprimé avec succès"})
	}
}
