package dtos

import "time"

// PaginatedProductsResponse représente une réponse paginée de produits
type PaginatedProductsResponse struct {
	Products   []ProductResponse `json:"products"`   // Liste des produits
	Total      int               `json:"total"`      // Nombre total de produits
	Page       int               `json:"page"`       // Page actuelle
	Limit      int               `json:"limit"`      // Nombre d'éléments par page
	TotalPages int               `json:"totalPages"` // Nombre total de pages
	HasNext    bool              `json:"hasNext"`    // Y a-t-il une page suivante ?
	HasPrev    bool              `json:"hasPrev"`    // Y a-t-il une page précédente ?
}

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

// PatchProductRequest DTO pour la mise à jour partielle d'un produit
// @Description Permet de mettre à jour uniquement certains champs d'un produit (tous les champs sont optionnels)
type PatchProductRequest struct {
	Name        *string  `json:"name,omitempty" example:"Crème hydratante"`                           // Nom du produit (optionnel)
	Description *string  `json:"description,omitempty" example:"Crème hydratante pour peau sensible"` // Description du produit (optionnel)
	Price       *float64 `json:"price,omitempty" example:"29.99"`                                     // Prix en euros (optionnel, doit être > 0 si fourni)
	Stock       *int     `json:"stock,omitempty" example:"50"`                                        // Quantité en stock (optionnel, doit être >= 0 si fourni)
	ImageURL    *string  `json:"imageURL,omitempty" example:"https://example.com/image.jpg"`          // URL de l'image du produit (optionnel)
	CategoryID  *string  `json:"categoryID,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"` // ID de la catégorie (optionnel, peut être null pour supprimer la catégorie)
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
