package dtos

import "time"

// CategoryRequest DTO pour la création/mise à jour d'une catégorie
type CategoryRequest struct {
	Name string `json:"name" validate:"required"`
}

// CategoryResponse DTO pour la réponse
type CategoryResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

