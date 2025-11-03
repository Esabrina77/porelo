package dtos

import "time"

// CategoryRequest DTO pour la création/mise à jour d'une catégorie
// @Description Informations catégorie pour création/modification
type CategoryRequest struct {
	Name string `json:"name" example:"Visage" binding:"required"` // Nom de la catégorie
}

// CategoryResponse DTO pour la réponse
// @Description Informations catégorie
type CategoryResponse struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"` // UUID de la catégorie
	Name      string    `json:"name" example:"Visage"`                             // Nom de la catégorie
	CreatedAt time.Time `json:"createdAt" example:"2024-01-01T00:00:00Z"`          // Date de création
	UpdatedAt time.Time `json:"updatedAt" example:"2024-01-01T00:00:00Z"`          // Date de mise à jour
}
