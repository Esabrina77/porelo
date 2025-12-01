package config

import (
	"github.com/joho/godotenv"
)

// init charge automatiquement le fichier .env lors de l'importation du package
// Cela garantit que les variables sont disponibles avant l'initialisation des autres packages
func init() {
	// Charger les variables d'environnement depuis le fichier .env
	if err := godotenv.Load(); err != nil {
		// Si le fichier .env n'existe pas, on continue quand même
		// Les variables peuvent être définies dans l'environnement système
	}
}

// LoadEnv charge les variables d'environnement depuis le fichier .env
// Cette fonction peut être appelée manuellement si nécessaire
func LoadEnv() {
	godotenv.Load()
}
