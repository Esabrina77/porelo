package dtos

import "time"

// UserRequest DTO pour la création/mise à jour d'un utilisateur
// @Description Informations utilisateur pour inscription/modification
type UserRequest struct {
	Email    string `json:"email" example:"user@example.com" binding:"required"`     // Email de l'utilisateur
	Password string `json:"password" example:"password123" binding:"required,min=6"` // Mot de passe (min 6 caractères)
}

// UserResponse DTO pour la réponse (sans le mot de passe)
// @Description Informations utilisateur (sans mot de passe)
type UserResponse struct {
	ID        string    `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"` // UUID de l'utilisateur
	Email     string    `json:"email" example:"user@example.com"`                  // Email de l'utilisateur
	Role      string    `json:"role" example:"USER" enums:"USER,ADMIN"`            // Rôle: USER ou ADMIN
	CreatedAt time.Time `json:"createdAt" example:"2024-01-01T00:00:00Z"`          // Date de création
	UpdatedAt time.Time `json:"updatedAt" example:"2024-01-01T00:00:00Z"`          // Date de mise à jour
}

// LoginRequest DTO pour la connexion
// @Description Identifiants de connexion
type LoginRequest struct {
	Email    string `json:"email" example:"user@example.com" binding:"required"` // Email de l'utilisateur
	Password string `json:"password" example:"password123" binding:"required"`   // Mot de passe
}

// LoginResponse DTO pour la réponse de connexion (token JWT)
// @Description Réponse de connexion avec token JWT
type LoginResponse struct {
	Token string       `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` // Token JWT
	User  UserResponse `json:"user"`                                                    // Informations de l'utilisateur
}
