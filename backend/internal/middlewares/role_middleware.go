package middlewares

import (
	"fmt"
	"net/http"

	"api/internal/utils"
)

// RequireRole : Vérifie si l'utilisateur a le rôle requis (doit être utilisé après AuthMiddleware)
func RequireRole(requiredRole string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Récupérer les claims depuis le Contexte
			claims, ok := GetUserClaims(r)
			if !ok {
				// Erreur si AuthMiddleware n'a pas été appelé ou erreur interne
				utils.RespondError(w, http.StatusForbidden, "Erreur d'autorisation interne: claims non trouvés")
				return
			}

			// 2. Vérifier le Rôle
			if claims.Role != requiredRole {
				utils.RespondError(w, http.StatusForbidden, fmt.Sprintf("Accès refusé. Rôle '%s' requis.", requiredRole))
				return
			}

			// L'utilisateur est autorisé
			next.ServeHTTP(w, r)
		})
	}
}

