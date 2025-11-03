package dtos

import "time"

// OrderItemRequest DTO pour un item dans une commande
type OrderItemRequest struct {
	ProductID string `json:"productID" validate:"required"`
	Quantity  int    `json:"quantity" validate:"required,gt=0"`
}

// CreateOrderRequest DTO pour créer une commande
type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items" validate:"required,min=1"`
}

// OrderItemResponse DTO pour la réponse d'un item
type OrderItemResponse struct {
	ID        string           `json:"id"`
	Quantity  int              `json:"quantity"`
	Price     float64          `json:"price"`
	Product   ProductResponse  `json:"product"`
}

// OrderResponse DTO pour la réponse d'une commande
type OrderResponse struct {
	ID          string              `json:"id"`
	OrderDate   time.Time           `json:"orderDate"`
	TotalAmount float64             `json:"totalAmount"`
	Status      string              `json:"status"`
	UserID      string              `json:"userID"`
	OrderItems  []OrderItemResponse `json:"orderItems"`
	CreatedAt   time.Time           `json:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt"`
}

// UpdateOrderStatusRequest DTO pour mettre à jour le statut d'une commande
type UpdateOrderStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=PENDING SHIPPED DELIVERED CANCELLED"`
}

