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

// GetAllProductsHandler gère la récupération de tous les produits (authentifié)
// @Summary      Liste tous les produits
// @Description  Récupère la liste de tous les produits disponibles avec leurs catégories (authentification requise)
// @Tags         Products
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dtos.ProductResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /products [get]
func GetAllProductsHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		products, err := services.GetAllProducts(client)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération des produits")
			return
		}

		utils.RespondJSON(w, http.StatusOK, products)
	}
}

// GetProductHandler gère la récupération d'un produit par ID (authentifié)
// @Summary      Détails d'un produit
// @Description  Récupère les détails d'un produit par son ID (authentification requise)
// @Tags         Products
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "ID du produit"
// @Success      200  {object}  dtos.ProductResponse
// @Failure      400  {object}  docs.ErrorResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /products/{id} [get]
func GetProductHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		productID := chi.URLParam(r, "id")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		product, err := services.GetProductByID(client, productID)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération du produit")
			return
		}

		if product == nil {
			utils.RespondError(w, http.StatusNotFound, "Produit non trouvé")
			return
		}

		utils.RespondJSON(w, http.StatusOK, product)
	}
}

// CreateProductHandler gère la création d'un produit (admin only)
// @Summary      Créer un produit
// @Description  Crée un nouveau produit (admin uniquement)
// @Tags         Products
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dtos.ProductRequest  true  "Informations du produit"
// @Success      201      {object}  dtos.ProductResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      403      {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      409      {object}  docs.ErrorResponse  "Produit avec ce nom existe déjà"
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /admin/products [post]
func CreateProductHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req dtos.ProductRequest

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Name == "" {
			utils.RespondError(w, http.StatusBadRequest, "Le nom du produit est requis")
			return
		}

		if req.Price <= 0 {
			utils.RespondError(w, http.StatusBadRequest, "Le prix doit être supérieur à 0")
			return
		}

		if req.Stock < 0 {
			utils.RespondError(w, http.StatusBadRequest, "Le stock ne peut pas être négatif")
			return
		}

		product, err := services.CreateProduct(client, req)
		if err != nil {
			if err.Error() == "un produit avec ce nom existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			if err.Error() == "catégorie non trouvée" {
				utils.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la création du produit")
			return
		}

		utils.RespondJSON(w, http.StatusCreated, product)
	}
}

// UpdateProductHandler gère la mise à jour d'un produit (admin only)
// @Summary      Mettre à jour un produit
// @Description  Met à jour un produit existant (admin uniquement)
// @Tags         Products
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string             true  "ID du produit"
// @Param        request  body      dtos.ProductRequest  true  "Nouvelles informations du produit"
// @Success      200      {object}  dtos.ProductResponse
// @Failure      400      {object}  docs.ErrorResponse
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      403      {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404      {object}  docs.ErrorResponse
// @Failure      409      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /admin/products/{id} [put]
func UpdateProductHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		productID := chi.URLParam(r, "id")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		var req dtos.ProductRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation basique
		if req.Name == "" {
			utils.RespondError(w, http.StatusBadRequest, "Le nom du produit est requis")
			return
		}

		if req.Price <= 0 {
			utils.RespondError(w, http.StatusBadRequest, "Le prix doit être supérieur à 0")
			return
		}

		if req.Stock < 0 {
			utils.RespondError(w, http.StatusBadRequest, "Le stock ne peut pas être négatif")
			return
		}

		product, err := services.UpdateProduct(client, productID, req)
		if err != nil {
			if err.Error() == "produit non trouvé" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
				return
			}
			if err.Error() == "un produit avec ce nom existe déjà" {
				utils.RespondError(w, http.StatusConflict, err.Error())
				return
			}
			if err.Error() == "catégorie non trouvée" {
				utils.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la mise à jour du produit")
			return
		}

		utils.RespondJSON(w, http.StatusOK, product)
	}
}

// DeleteProductHandler gère la suppression d'un produit (admin only)
// @Summary      Supprimer un produit
// @Description  Supprime un produit (admin uniquement)
// @Tags         Products
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "ID du produit"
// @Success      204  "No Content"
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      403  {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /admin/products/{id} [delete]
func DeleteProductHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		productID := chi.URLParam(r, "id")
		if productID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de produit requis")
			return
		}

		err := services.DeleteProduct(client, productID)
		if err != nil {
			if err.Error() == "erreur lors de la suppression du produit: record to delete does not exist" {
				utils.RespondError(w, http.StatusNotFound, "Produit non trouvé")
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la suppression du produit")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
