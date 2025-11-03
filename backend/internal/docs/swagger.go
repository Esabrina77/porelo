package docs

// Ce fichier contient uniquement les types communs pour Swagger
// Les annotations Swagger sont dans main.go

// @contact.name   Support API
// @contact.email  support@porelo.com

// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" suivi d'un espace et du token JWT. Exemple: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Types communs pour Swagger
type ErrorResponse struct {
	Error string `json:"error" example:"Message d'erreur"`
}

type SuccessMessage struct {
	Message string `json:"message" example:"Opération réussie"`
}
