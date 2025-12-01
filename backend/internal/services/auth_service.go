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

	// Générer l'access token JWT (15 minutes)
	accessToken, err := utils.GenerateToken(newUser.ID, newUser.Email, newUser.Role, AccessTokenExpiration)
	if err != nil {
		return nil, err
	}

	// Créer le refresh token (7 jours)
	refreshToken, err := CreateRefreshToken(client, newUser.ID)
	if err != nil {
		return nil, err
	}

	return &dtos.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
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

	// Générer l'access token JWT (15 minutes)
	accessToken, err := utils.GenerateToken(user.ID, user.Email, user.Role, AccessTokenExpiration)
	if err != nil {
		return nil, err
	}

	// Créer le refresh token (7 jours)
	refreshToken, err := CreateRefreshToken(client, user.ID)
	if err != nil {
		return nil, err
	}

	return &dtos.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dtos.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			UpdatedAt: user.UpdatedAt,
		},
	}, nil
}

// RefreshAccessToken génère un nouveau access token à partir d'un refresh token
func RefreshAccessToken(client *db.PrismaClient, refreshTokenString string) (*dtos.RefreshTokenResponse, error) {
	// Valider le refresh token
	refreshToken, err := ValidateRefreshToken(client, refreshTokenString)
	if err != nil {
		return nil, err
	}

	// Récupérer l'utilisateur
	user, err := GetUserByID(client, refreshToken.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("utilisateur non trouvé")
	}

	// Générer un nouveau access token
	accessToken, err := utils.GenerateToken(user.ID, user.Email, user.Role, AccessTokenExpiration)
	if err != nil {
		return nil, err
	}

	// Rotation du refresh token (bonne pratique de sécurité)
	// Créer un nouveau refresh token et révoquer l'ancien
	newRefreshToken, err := RotateRefreshToken(client, refreshTokenString, user.ID)
	if err != nil {
		// Si la rotation échoue, on retourne quand même le nouveau access token
		// mais on garde l'ancien refresh token
		return &dtos.RefreshTokenResponse{
			AccessToken: accessToken,
		}, nil
	}

	// Retourner le nouveau access token et le nouveau refresh token
	return &dtos.RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

// Logout révoque le refresh token actuel
func Logout(client *db.PrismaClient, refreshTokenString string) error {
	return RevokeRefreshToken(client, refreshTokenString)
}

// LogoutAll révoque tous les refresh tokens d'un utilisateur
func LogoutAll(client *db.PrismaClient, userID string) error {
	return RevokeAllUserRefreshTokens(client, userID)
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
