package dtos

import "time"

// CreateReviewRequest DTO pour créer un avis
// @Description Avis utilisateur sur un produit
type CreateReviewRequest struct {
	ProductID string  `json:"productID" example:"550e8400-e29b-41d4-a716-446655440000" binding:"required"` // ID du produit
	Rating    int     `json:"rating" example:"5" binding:"required,min=1,max=5"`                           // Note de 1 à 5 (obligatoire)
	Comment   *string `json:"comment,omitempty" example:"Excellent produit, très satisfait !"`             // Commentaire (optionnel)
}

// UpdateReviewRequest DTO pour mettre à jour un avis
// @Description Mise à jour d'un avis existant
type UpdateReviewRequest struct {
	Rating  *int    `json:"rating,omitempty" example:"4" binding:"omitempty,min=1,max=5"`        // Note de 1 à 5 (optionnel)
	Comment *string `json:"comment,omitempty" example:"Bon produit mais pourrait être meilleur"` // Commentaire (optionnel)
}

// ReviewResponse DTO pour la réponse d'un avis
// @Description Informations complètes d'un avis
type ReviewResponse struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`        // UUID de l'avis
	Rating    int       `json:"rating" example:"5"`                                       // Note de 1 à 5
	Comment   *string   `json:"comment,omitempty" example:"Excellent produit !"`          // Commentaire (optionnel)
	UserID    string    `json:"userID" example:"550e8400-e29b-41d4-a716-446655440000"`    // ID de l'utilisateur
	UserEmail string    `json:"userEmail" example:"user@example.com"`                     // Email de l'utilisateur (pour affichage)
	ProductID string    `json:"productID" example:"550e8400-e29b-41d4-a716-446655440000"` // ID du produit
	CreatedAt time.Time `json:"createdAt" example:"2024-01-01T00:00:00Z"`                 // Date de création
	UpdatedAt time.Time `json:"updatedAt" example:"2024-01-01T00:00:00Z"`                 // Date de mise à jour
}

// ProductReviewsResponse DTO pour la réponse avec statistiques
// @Description Liste des avis avec statistiques (moyenne, total)
type ProductReviewsResponse struct {
	Reviews       []ReviewResponse `json:"reviews"`                     // Liste des avis
	AverageRating float64          `json:"averageRating" example:"4.5"` // Note moyenne (0-5)
	TotalReviews  int              `json:"totalReviews" example:"10"`   // Nombre total d'avis
}
