package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims contient les informations stockées dans le token JWT
type JWTClaims struct {
	UserID string `json:"userID"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte(getJWTSecret())

// getJWTSecret récupère la clé secrète depuis les variables d'environnement
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Clé par défaut pour le développement (NE PAS UTILISER EN PRODUCTION)
		return "default-secret-key-change-in-production"
	}
	return secret
}

// GenerateToken génère un token JWT avec les informations de l'utilisateur
func GenerateToken(userID, email, role string) (string, error) {
	// Durée de vie du token : 24 heures
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	// Créer le token avec la méthode de signature HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Signer le token avec la clé secrète
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken valide un token JWT et retourne les claims
func ValidateToken(tokenString string) (*JWTClaims, error) {
	// Parser le token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Vérifier que la méthode de signature est HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("méthode de signature invalide")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Extraire les claims
	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("token invalide")
	}

	// Vérifier si le token est expiré (vérifié automatiquement par jwt-go, mais on peut le faire explicitement)
	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expiré")
	}

	return claims, nil
}

