package dtos

import "time"

// OrderItemRequest DTO pour un item dans une commande
// @Description Item de commande avec produit et quantité
type OrderItemRequest struct {
	ProductID string `json:"productID" example:"550e8400-e29b-41d4-a716-446655440000" binding:"required"` // ID du produit
	Quantity  int    `json:"quantity" example:"2" binding:"required,gt=0"`                                // Quantité commandée (doit être > 0)
}

// CreateOrderRequest DTO pour créer une commande
// @Description Requête de création de commande
type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items" binding:"required,min=1"` // Liste des items de la commande (minimum 1)
}

// OrderItemResponse DTO pour la réponse d'un item
// @Description Item de commande avec détails du produit
type OrderItemResponse struct {
	ID       string          `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"` // UUID de l'item
	Quantity int             `json:"quantity" example:"2"`                              // Quantité commandée
	Price    float64         `json:"price" example:"29.99"`                             // Prix unitaire au moment de la commande
	Product  ProductResponse `json:"product"`                                           // Détails du produit
}

// OrderResponse DTO pour la réponse d'une commande
// @Description Informations complètes d'une commande
type OrderResponse struct {
	ID          string              `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`                    // UUID de la commande
	OrderDate   time.Time           `json:"orderDate" example:"2024-01-01T00:00:00Z"`                             // Date de la commande
	TotalAmount float64             `json:"totalAmount" example:"59.98"`                                          // Montant total de la commande
	Status      string              `json:"status" example:"PENDING" enums:"PENDING,SHIPPED,DELIVERED,CANCELLED"` // Statut de la commande
	UserID      string              `json:"userID" example:"550e8400-e29b-41d4-a716-446655440000"`                // ID de l'utilisateur
	OrderItems  []OrderItemResponse `json:"orderItems"`                                                           // Liste des items de la commande
	CreatedAt   time.Time           `json:"createdAt" example:"2024-01-01T00:00:00Z"`                             // Date de création
	UpdatedAt   time.Time           `json:"updatedAt" example:"2024-01-01T00:00:00Z"`                             // Date de mise à jour
}

// UpdateOrderStatusRequest DTO pour mettre à jour le statut d'une commande
// @Description Nouveau statut de commande
type UpdateOrderStatusRequest struct {
	Status string `json:"status" example:"SHIPPED" binding:"required,oneof=PENDING SHIPPED DELIVERED CANCELLED"` // Nouveau statut
}
