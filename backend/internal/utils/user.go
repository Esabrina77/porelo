package utils

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {

	//hasher le password

	HashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(HashedPassword), err
}

func CheckPassWord(password, HashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(HashedPassword), []byte(password))

	return err == nil
}

func RespondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func RespondError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// MaskEmail masque un email pour la confidentialité
// Exemple: "sabrina@gmail.com" -> "sa**********m"
// Prend les 2 premiers caractères de l'email complet, masque le reste, et garde le dernier caractère
func MaskEmail(email string) string {
	if email == "" {
		return ""
	}

	// Si l'email fait 3 caractères ou moins, tout masquer sauf indication minimale
	if len(email) <= 2 {
		return "**"
	}

	if len(email) == 3 {
		// Exemple: "ab@" -> "a**"
		return string(email[0]) + "**"
	}

	// Prendre les 2 premiers caractères
	firstTwo := email[:2]

	// Prendre le dernier caractère
	lastChar := string(email[len(email)-1])

	// Calculer le nombre d'astérisques (10 par défaut pour masquer la longueur réelle)
	starsCount := 10
	if len(email) <= 13 {
		// Si l'email est court, ajuster le nombre d'astérisques
		// Mais on garde toujours au moins 8 astérisques pour la sécurité
		starsCount = 8
	}

	return firstTwo + repeatString("*", starsCount) + lastChar
}

// repeatString répète une chaîne n fois
func repeatString(s string, n int) string {
	if n <= 0 {
		return ""
	}
	result := ""
	for i := 0; i < n; i++ {
		result += s
	}
	return result
}
