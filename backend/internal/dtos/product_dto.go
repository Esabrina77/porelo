package dtos

import "time"

// ProductRequest DTO pour la création/mise à jour d'un produit
type ProductRequest struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	Stock       int     `json:"stock" validate:"gte=0"`
	ImageURL    string  `json:"imageURL"`
	CategoryID  string  `json:"categoryID"`
}

// ProductResponse DTO pour la réponse
type ProductResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	ImageURL    string    `json:"imageURL"`
	CategoryID  *string   `json:"categoryID,omitempty"`
	Category    *CategoryResponse `json:"category,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

