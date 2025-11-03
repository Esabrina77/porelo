package dtos

import "time"

// UserRequest DTO pour la création/mise à jour d'un utilisateur
type UserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// UserResponse DTO pour la réponse (sans le mot de passe)
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// LoginRequest DTO pour la connexion
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse DTO pour la réponse de connexion (token JWT)
type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

