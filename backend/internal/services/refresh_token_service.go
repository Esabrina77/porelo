package services

import (
	"api/internal/db"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"strconv"
	"time"
)

// getRefreshTokenExpiration récupère la durée d'expiration du refresh token depuis .env
// OBLIGATOIRE : doit être défini dans les variables d'environnement pour la sécurité
func getRefreshTokenExpiration() (time.Duration, error) {
	hoursStr := os.Getenv("REFRESH_TOKEN_EXPIRATION_HOURS")
	if hoursStr == "" {
		return 0, errors.New("REFRESH_TOKEN_EXPIRATION_HOURS doit être défini dans .env pour la sécurité")
	}

	hours, err := strconv.Atoi(hoursStr)
	if err != nil {
		return 0, errors.New("REFRESH_TOKEN_EXPIRATION_HOURS doit être un nombre entier valide")
	}

	if hours <= 0 {
		return 0, errors.New("REFRESH_TOKEN_EXPIRATION_HOURS doit être supérieur à 0")
	}

	return time.Duration(hours) * time.Hour, nil
}

// getAccessTokenExpiration récupère la durée d'expiration de l'access token depuis .env
// OBLIGATOIRE : doit être défini dans les variables d'environnement pour la sécurité
func getAccessTokenExpiration() (time.Duration, error) {
	minutesStr := os.Getenv("ACCESS_TOKEN_EXPIRATION_MINUTES")
	if minutesStr == "" {
		return 0, errors.New("ACCESS_TOKEN_EXPIRATION_MINUTES doit être défini dans .env pour la sécurité")
	}

	minutes, err := strconv.Atoi(minutesStr)
	if err != nil {
		return 0, errors.New("ACCESS_TOKEN_EXPIRATION_MINUTES doit être un nombre entier valide")
	}

	if minutes <= 0 {
		return 0, errors.New("ACCESS_TOKEN_EXPIRATION_MINUTES doit être supérieur à 0")
	}

	return time.Duration(minutes) * time.Minute, nil
}

// RefreshTokenExpiration durée de vie du refresh token (OBLIGATOIRE dans .env)
var RefreshTokenExpiration time.Duration

// AccessTokenExpiration durée de vie de l'access token (OBLIGATOIRE dans .env)
var AccessTokenExpiration time.Duration

// init initialise les durées d'expiration depuis les variables d'environnement
// Panic si les variables ne sont pas définies (sécurité obligatoire)
// NOTE: Cette fonction s'exécute après le chargement du .env dans main.go
func init() {
	var err error

	RefreshTokenExpiration, err = getRefreshTokenExpiration()
	if err != nil {
		panic("Configuration de sécurité manquante: " + err.Error() +
			"\nAssurez-vous que le fichier .env est chargé AVANT l'initialisation des services." +
			"\nVérifiez que REFRESH_TOKEN_EXPIRATION_HOURS est défini dans votre fichier .env")
	}

	AccessTokenExpiration, err = getAccessTokenExpiration()
	if err != nil {
		panic("Configuration de sécurité manquante: " + err.Error() +
			"\nAssurez-vous que le fichier .env est chargé AVANT l'initialisation des services." +
			"\nVérifiez que ACCESS_TOKEN_EXPIRATION_MINUTES est défini dans votre fichier .env")
	}
}

// GenerateRefreshToken génère un token aléatoire sécurisé
func GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32) // 256 bits
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// CreateRefreshToken crée un refresh token pour un utilisateur
func CreateRefreshToken(client *db.PrismaClient, userID string) (string, error) {
	token, err := GenerateRefreshToken()
	if err != nil {
		return "", err
	}

	expiresAt := time.Now().Add(RefreshTokenExpiration)

	ctx := context.Background()
	_, err = client.RefreshToken.CreateOne(
		db.RefreshToken.Token.Set(token),
		db.RefreshToken.User.Link(db.User.ID.Equals(userID)),
		db.RefreshToken.ExpiresAt.Set(expiresAt),
	).Exec(ctx)

	if err != nil {
		return "", err
	}

	return token, nil
}

// ValidateRefreshToken valide un refresh token et retourne l'utilisateur associé
func ValidateRefreshToken(client *db.PrismaClient, token string) (*db.RefreshTokenModel, error) {
	ctx := context.Background()
	refreshToken, err := client.RefreshToken.FindUnique(
		db.RefreshToken.Token.Equals(token),
	).Exec(ctx)

	if err != nil {
		return nil, errors.New("refresh token invalide")
	}

	// Vérifier si le token est révoqué
	if refreshToken.Revoked {
		return nil, errors.New("refresh token révoqué")
	}

	// Vérifier si le token est expiré
	if time.Now().After(refreshToken.ExpiresAt) {
		// Marquer comme révoqué pour nettoyage
		client.RefreshToken.FindUnique(
			db.RefreshToken.ID.Equals(refreshToken.ID),
		).Update(
			db.RefreshToken.Revoked.Set(true),
		).Exec(ctx)
		return nil, errors.New("refresh token expiré")
	}

	return refreshToken, nil
}

// RevokeRefreshToken révoque un refresh token spécifique
func RevokeRefreshToken(client *db.PrismaClient, token string) error {
	ctx := context.Background()
	_, err := client.RefreshToken.FindUnique(
		db.RefreshToken.Token.Equals(token),
	).Update(
		db.RefreshToken.Revoked.Set(true),
	).Exec(ctx)

	return err
}

// RevokeAllUserRefreshTokens révoque tous les refresh tokens d'un utilisateur
func RevokeAllUserRefreshTokens(client *db.PrismaClient, userID string) error {
	ctx := context.Background()
	_, err := client.RefreshToken.FindMany(
		db.RefreshToken.UserID.Equals(userID),
		db.RefreshToken.Revoked.Equals(false),
	).Update(
		db.RefreshToken.Revoked.Set(true),
	).Exec(ctx)

	return err
}

// RotateRefreshToken crée un nouveau refresh token et révoque l'ancien (rotation)
func RotateRefreshToken(client *db.PrismaClient, oldToken string, userID string) (string, error) {
	// Révoquer l'ancien token
	err := RevokeRefreshToken(client, oldToken)
	if err != nil {
		return "", err
	}

	// Créer un nouveau token
	return CreateRefreshToken(client, userID)
}

// CleanupExpiredTokens supprime les tokens expirés de la base de données (à appeler périodiquement)
func CleanupExpiredTokens(client *db.PrismaClient) error {
	ctx := context.Background()
	_, err := client.RefreshToken.FindMany(
		db.RefreshToken.ExpiresAt.Before(time.Now()),
	).Delete().Exec(ctx)

	return err
}
