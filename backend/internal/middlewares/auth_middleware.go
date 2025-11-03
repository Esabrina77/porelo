package middlewares

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"api/internal/utils"
)

// ContextKey type pour les clés de contexte
type ContextKey string

const UserClaimsKey ContextKey = "userClaims"

// AuthMiddleware : Vérifie si un token JWT valide est présent
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Récupérer le Header Authorization
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.RespondError(w, http.StatusUnauthorized, "Token d'authentification requis")
			return
		}

		// 2. Vérifier le format 'Bearer <token>'
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.RespondError(w, http.StatusUnauthorized, "Format du token invalide. Utilisez: Bearer <token>")
			return
		}
		tokenString := parts[1]

		// 3. Valider le token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			utils.RespondError(w, http.StatusUnauthorized, fmt.Sprintf("Token invalide ou expiré: %v", err))
			return
		}

		// 4. Stocker les claims dans le Contexte de la requête
		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)

		// Passer au Handler suivant
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserClaims extrait les claims utilisateur du contexte
func GetUserClaims(r *http.Request) (*utils.JWTClaims, bool) {
	claims, ok := r.Context().Value(UserClaimsKey).(*utils.JWTClaims)
	return claims, ok
}

