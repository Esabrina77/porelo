package dtos

import "time"

// ProductRequest DTO pour la création/mise à jour d'un produit
// @Description Informations produit pour création/modification
type ProductRequest struct {
	Name        string  `json:"name" example:"Crème hydratante" binding:"required"`        // Nom du produit
	Description string  `json:"description" example:"Crème hydratante pour peau sensible"` // Description du produit
	Price       float64 `json:"price" example:"29.99" binding:"required,gt=0"`             // Prix en euros (doit être > 0)
	Stock       int     `json:"stock" example:"50" binding:"gte=0"`                        // Quantité en stock
	ImageURL    string  `json:"imageURL" example:"https://example.com/image.jpg"`          // URL de l'image du produit
	CategoryID  string  `json:"categoryID" example:"550e8400-e29b-41d4-a716-446655440000"` // ID de la catégorie (optionnel)
}

// ProductResponse DTO pour la réponse
// @Description Informations produit avec catégorie
type ProductResponse struct {
	ID          string            `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`                   // UUID du produit
	Name        string            `json:"name" example:"Crème hydratante"`                                     // Nom du produit
	Description string            `json:"description" example:"Crème hydratante pour peau sensible"`           // Description
	Price       float64           `json:"price" example:"29.99"`                                               // Prix en euros
	Stock       int               `json:"stock" example:"50"`                                                  // Quantité en stock
	ImageURL    string            `json:"imageURL" example:"https://example.com/image.jpg"`                    // URL de l'image
	CategoryID  *string           `json:"categoryID,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"` // ID de la catégorie
	Category    *CategoryResponse `json:"category,omitempty"`                                                  // Informations de la catégorie (si disponible)
	CreatedAt   time.Time         `json:"createdAt" example:"2024-01-01T00:00:00Z"`                            // Date de création
	UpdatedAt   time.Time         `json:"updatedAt" example:"2024-01-01T00:00:00Z"`                            // Date de mise à jour
}
