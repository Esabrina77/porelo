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

// CreateOrderHandler gère la création d'une commande (authentifié)
// @Summary      Créer une commande
// @Description  Crée une nouvelle commande avec les produits sélectionnés. Le stock est automatiquement déduit.
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        request  body      dtos.CreateOrderRequest  true  "Items de la commande"
// @Success      201      {object}  dtos.OrderResponse
// @Failure      400      {object}  docs.ErrorResponse  "Stock insuffisant ou produit non trouvé"
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /orders [post]
func CreateOrderHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Récupérer l'utilisateur depuis le contexte
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}

		var req dtos.CreateOrderRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Validation
		if len(req.Items) == 0 {
			utils.RespondError(w, http.StatusBadRequest, "Une commande doit contenir au moins un produit")
			return
		}

		order, err := services.CreateOrder(client, claims.UserID, req)
		if err != nil {
			if err.Error() == "une commande doit contenir au moins un produit" ||
				err.Error() == "stock insuffisant" ||
				err.Error()[:24] == "produit avec l'ID" {
				utils.RespondError(w, http.StatusBadRequest, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la création de la commande")
			return
		}

		utils.RespondJSON(w, http.StatusCreated, order)
	}
}

// GetUserOrdersHandler gère la récupération des commandes de l'utilisateur connecté
// @Summary      Liste les commandes de l'utilisateur
// @Description  Récupère toutes les commandes de l'utilisateur connecté
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dtos.OrderResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /orders [get]
func GetUserOrdersHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}

		orders, err := services.GetUserOrders(client, claims.UserID)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération des commandes")
			return
		}

		utils.RespondJSON(w, http.StatusOK, orders)
	}
}

// GetAllOrdersHandler gère la récupération de toutes les commandes (admin only)
// @Summary      Liste toutes les commandes
// @Description  Récupère toutes les commandes de tous les utilisateurs (admin uniquement)
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {array}   dtos.OrderResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      403  {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /admin/orders [get]
func GetAllOrdersHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orders, err := services.GetAllOrders(client)
		if err != nil {
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération des commandes")
			return
		}

		utils.RespondJSON(w, http.StatusOK, orders)
	}
}

// GetOrderHandler gère la récupération d'une commande par ID
// @Summary      Détails d'une commande
// @Description  Récupère les détails d'une commande. L'utilisateur peut voir ses propres commandes, l'admin peut voir toutes les commandes.
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id   path      string  true  "ID de la commande"
// @Success      200  {object}  dtos.OrderResponse
// @Failure      401  {object}  docs.ErrorResponse
// @Failure      404  {object}  docs.ErrorResponse
// @Failure      500  {object}  docs.ErrorResponse
// @Router       /orders/{id} [get]
func GetOrderHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := middlewares.GetUserClaims(r)
		if !ok {
			utils.RespondError(w, http.StatusUnauthorized, "Non authentifié")
			return
		}

		orderID := chi.URLParam(r, "id")
		if orderID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de commande requis")
			return
		}

		isAdmin := claims.Role == "ADMIN"
		order, err := services.GetOrderByID(client, orderID, claims.UserID, isAdmin)
		if err != nil {
			if err.Error() == "commande non trouvée" || err.Error() == "accès non autorisé à cette commande" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la récupération de la commande")
			return
		}

		utils.RespondJSON(w, http.StatusOK, order)
	}
}

// UpdateOrderStatusHandler gère la mise à jour du statut d'une commande (admin only)
// @Summary      Mettre à jour le statut d'une commande
// @Description  Met à jour le statut d'une commande (PENDING, SHIPPED, DELIVERED, CANCELLED) - admin uniquement
// @Tags         Orders
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id       path      string                        true  "ID de la commande"
// @Param        request  body      dtos.UpdateOrderStatusRequest  true  "Nouveau statut"
// @Success      200      {object}  dtos.OrderResponse
// @Failure      400      {object}  docs.ErrorResponse  "Statut invalide"
// @Failure      401      {object}  docs.ErrorResponse
// @Failure      403      {object}  docs.ErrorResponse  "Accès refusé - Admin requis"
// @Failure      404      {object}  docs.ErrorResponse
// @Failure      500      {object}  docs.ErrorResponse
// @Router       /admin/orders/{id}/status [put]
func UpdateOrderStatusHandler(client *db.PrismaClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orderID := chi.URLParam(r, "id")
		if orderID == "" {
			utils.RespondError(w, http.StatusBadRequest, "ID de commande requis")
			return
		}

		var req dtos.UpdateOrderStatusRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.RespondError(w, http.StatusBadRequest, "JSON invalide")
			return
		}

		// Convertir le statut string en db.OrderStatus
		var status db.OrderStatus
		switch req.Status {
		case "PENDING":
			status = db.OrderStatus("PENDING")
		case "SHIPPED":
			status = db.OrderStatus("SHIPPED")
		case "DELIVERED":
			status = db.OrderStatus("DELIVERED")
		case "CANCELLED":
			status = db.OrderStatus("CANCELLED")
		default:
			utils.RespondError(w, http.StatusBadRequest, "Statut invalide. Valeurs acceptées: PENDING, SHIPPED, DELIVERED, CANCELLED")
			return
		}

		order, err := services.UpdateOrderStatus(client, orderID, status)
		if err != nil {
			if err.Error() == "commande non trouvée" {
				utils.RespondError(w, http.StatusNotFound, err.Error())
				return
			}
			utils.RespondError(w, http.StatusInternalServerError, "Erreur lors de la mise à jour du statut")
			return
		}

		utils.RespondJSON(w, http.StatusOK, order)
	}
}
