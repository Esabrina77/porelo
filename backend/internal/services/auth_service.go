package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"api/internal/utils"
	"errors"
)

// Register crée un nouvel utilisateur et retourne un token JWT
func Register(client *db.PrismaClient, email, password string) (*dtos.LoginResponse, error) {
	// Vérifier si l'email existe déjà
	existingUser, err := GetUserByEmail(client, email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("l'email existe déjà")
	}

	// Créer le nouvel utilisateur
	newUser, err := CreateUser(client, email, password)
	if err != nil {
		return nil, err
	}

	// Générer le token JWT
	token, err := utils.GenerateToken(newUser.ID, newUser.Email, newUser.Role)
	if err != nil {
		return nil, err
	}

	return &dtos.LoginResponse{
		Token: token,
		User: dtos.UserResponse{
			ID:        newUser.ID,
			Email:     newUser.Email,
			Role:      newUser.Role,
			CreatedAt: newUser.CreatedAt,
			UpdatedAt: newUser.UpdatedAt,
		},
	}, nil
}

// Login authentifie un utilisateur et retourne un token JWT
func Login(client *db.PrismaClient, email, password string) (*dtos.LoginResponse, error) {
	// Récupérer l'utilisateur par email
	user, err := GetUserByEmail(client, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("email ou mot de passe incorrect")
	}

	// Vérifier le mot de passe
	if !utils.CheckPassWord(password, user.Password) {
		return nil, errors.New("email ou mot de passe incorrect")
	}

	// Générer le token JWT
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &dtos.LoginResponse{
		Token: token,
		User: dtos.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	}, nil
}

// GetCurrentUser récupère l'utilisateur actuel depuis la base de données
func GetCurrentUser(client *db.PrismaClient, userID string) (*dtos.UserResponse, error) {
	user, err := GetUserByID(client, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("utilisateur non trouvé")
	}

	return &dtos.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}
