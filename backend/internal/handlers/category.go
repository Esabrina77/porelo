package handlers

import (
	"encoding/json"
	"net/http"

	"api/internal/db"
	"api/internal/docs"
	"api/internal/dtos"
	"api/internal/services"
	"api/internal/utils"

	"github.com/go-chi/chi/v5"
)

// Utilisation des types docs pour Swagger
var _ = docs.ErrorResponse{}

// GetAllCategoriesHandler gère la récupération de toutes les catégories (admin only)
// @Summary      Liste toutes les catégories
// @Description  Récupère la liste de toutes les catégories (admin uniquement)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dtos.CategoryResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      403  {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /admin/categories [get]
func GetAllCategoriesHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categories, err := services.GetAllCategories(client)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération des catégories")
			return
		}

		utils.RespondJSON(w, http.StatusOK, categories)
	}
}

// GetCategoryHandler gère la récupération d'une catégorie par ID (admin only)
// @Summary      Détails d'une catégorie
// @Description  Récupère les détails d'une catégorie par son ID (admin uniquement)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "ID de la catégorie"
// @Success      200  {object}  dtos.CategoryResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      403  {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /admin/categories/{id} [get]
func GetCategoryHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categoryID := chi.URLParam(r, "id")
		if categoryID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de catégorie requis")
			return
		}

		category, err := services.GetCategoryByID(client, categoryID)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération de la catégorie")
			return
		}

		if category == nil {
			utils.RespondError(w, http.StatusNotFound, "Catégorie non trouvée")
			return
		}

		utils.RespondJSON(w, http.StatusOK, category)
	}
}

// CreateCategoryHandler gère la création d'une catégorie (admin only)
// @Summary      Créer une catégorie
// @Description  Crée une nouvelle catégorie (admin uniquement)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dtos.CategoryRequest  true  "Informations de la catégorie"
// @Success      201      {object}  dtos.CategoryResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      403      {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      409      {object}  docs.ErrorResponse  "Catégorie avec ce nom existe déjà"
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /admin/categories [post]
func CreateCategoryHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req dtos.CategoryRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Name == "" {
			utils.RespondError(w, http.StatusBadRequest, "Le nom de la catégorie est requis")
			return
		}

		category, err := services.CreateCategory(client, req)
		if err != nil {
			if err.Error() == "une catégorie avec ce nom existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la création de la catégorie")
			return
		}

		utils.RespondJSON(w, http.StatusCreated, category)
	}
}

// UpdateCategoryHandler gère la mise à jour d'une catégorie (admin only)
// @Summary      Mettre à jour une catégorie
// @Description  Met à jour une catégorie existante (admin uniquement)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                true  "ID de la catégorie"
// @Param        request  body      dtos.CategoryRequest  true  "Nouvelles informations de la catégorie"
// @Success      200      {object}  dtos.CategoryResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      403      {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404      {object}  docs.ErrorResponse
// @Failure      409      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /admin/categories/{id} [put]
func UpdateCategoryHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categoryID := chi.URLParam(r, "id")
		if categoryID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de catégorie requis")
			return
		}

		var req dtos.CategoryRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Name == "" {
			utils.RespondError(w, http.StatusBadRequest, "Le nom de la catégorie est requis")
			return
		}

		category, err := services.UpdateCategory(client, categoryID, req)
		if err != nil {
			if err.Error() == "catégorie non trouvée" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
				return
			}
			if err.Error() == "une catégorie avec ce nom existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la mise à jour de la catégorie")
			return
		}

		utils.RespondJSON(w, http.StatusOK, category)
	}
}

// DeleteCategoryHandler gère la suppression d'une catégorie (admin only)
// @Summary      Supprimer une catégorie
// @Description  Supprime une catégorie (admin uniquement)
// @Tags         Categories
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "ID de la catégorie"
// @Success      204  "No Content"
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      403  {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /admin/categories/{id} [delete]
func DeleteCategoryHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		categoryID := chi.URLParam(r, "id")
		if categoryID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de catégorie requis")
			return
		}

		err := services.DeleteCategory(client, categoryID)
		if err != nil {
			if err.Error() == "erreur lors de la suppression de la catégorie: record to delete does not exist" {
				utils.RespondError(w, http.StatusNotFound, "Catégorie non trouvée")
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la suppression de la catégorie")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
