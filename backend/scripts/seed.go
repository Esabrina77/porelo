package main

import (
	"api/internal/db"
	"context"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatal("Erreur de connexion Prisma: ", err)
	}
	defer client.Disconnect()

	ctx := context.Background()

	// Créer l'utilisateur admin
	adminEmail := "momo@ynov.com"
	adminPassword := "Password2025"

	// Vérifier si l'admin existe déjà
	existingAdmin, err := client.User.FindUnique(
		db.User.Email.Equals(adminEmail),
	).Exec(ctx)

	var adminID string
	if err != nil || existingAdmin == nil {
		// Créer le hash du mot de passe
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
		if err != nil {
			log.Fatal("Erreur lors du hashage du mot de passe: ", err)
		}

		// Créer l'utilisateur admin
		admin, err := client.User.CreateOne(
			db.User.Email.Set(adminEmail),
			db.User.Password.Set(string(hashedPassword)),
			db.User.Role.Set(db.Role("ADMIN")),
		).Exec(ctx)

		if err != nil {
			log.Fatal("Erreur lors de la création de l'admin: ", err)
		}

		adminID = admin.ID
		log.Printf("✅ Admin créé: %s (ID: %s)", adminEmail, adminID)
	} else {
		adminID = existingAdmin.ID
		// Mettre à jour le rôle si nécessaire
		if existingAdmin.Role != db.Role("ADMIN") {
			_, err := client.User.FindUnique(
				db.User.ID.Equals(adminID),
			).Update(
				db.User.Role.Set(db.Role("ADMIN")),
			).Exec(ctx)
			if err != nil {
				log.Fatal("Erreur lors de la mise à jour du rôle admin: ", err)
			}
			log.Printf("✅ Rôle admin mis à jour pour: %s", adminEmail)
		} else {
			log.Printf("ℹ️  Admin existe déjà: %s (ID: %s)", adminEmail, adminID)
		}
	}

	// Créer quelques catégories de test
	log.Println("\n📂 Création des catégories...")
	categories := []struct {
		name string
	}{
		{name: "Visage"},
		{name: "Corps"},
		{name: "Cheveux"},
		{name: "Homme"},
	}

	categoryMap := make(map[string]string)
	for _, cat := range categories {
		existingCat, err := client.Category.FindUnique(
			db.Category.Name.Equals(cat.name),
		).Exec(ctx)

		var categoryID string
		if err != nil || existingCat == nil {
			category, err := client.Category.CreateOne(
				db.Category.Name.Set(cat.name),
			).Exec(ctx)
			if err != nil {
				log.Printf("⚠️  Erreur lors de la création de la catégorie %s: %v", cat.name, err)
				continue
			}
			categoryID = category.ID
			log.Printf("  ✅ Catégorie créée: %s (ID: %s)", cat.name, categoryID)
		} else {
			categoryID = existingCat.ID
			log.Printf("  ℹ️  Catégorie existe déjà: %s (ID: %s)", cat.name, categoryID)
		}
		categoryMap[cat.name] = categoryID
	}

	// Créer quelques produits de test
	log.Println("\n🛍️  Création des produits...")
	products := []struct {
		name        string
		description string
		price       float64
		stock       int
		imageURL    string
		category    string
	}{
		{
			name:        "Crème hydratante visage",
			description: "Crème hydratante quotidienne pour tous les types de peaux. Formule enrichie en acide hyaluronique.",
			price:       29.99,
			stock:       50,
			imageURL:    "https://example.com/images/creme-hydratante.jpg",
			category:    "Visage",
		},
		{
			name:        "Sérum anti-âge",
			description: "Sérum concentré en peptides et vitamines pour réduire les signes de l'âge.",
			price:       49.99,
			stock:       30,
			imageURL:    "https://example.com/images/serum-antiage.jpg",
			category:    "Visage",
		},
		{
			name:        "Gel douche relaxant",
			description: "Gel douche parfumé à la lavande pour un moment de détente quotidien.",
			price:       15.99,
			stock:       80,
			imageURL:    "https://example.com/images/gel-douche.jpg",
			category:    "Corps",
		},
		{
			name:        "Shampooing réparateur",
			description: "Shampooing intensif pour cheveux abîmés, enrichi en kératine et protéines.",
			price:       19.99,
			stock:       60,
			imageURL:    "https://example.com/images/shampooing.jpg",
			category:    "Cheveux",
		},
		{
			name:        "Soin après-rasage",
			description: "Lotion apaisante après-rasage pour homme, réduit les irritations.",
			price:       24.99,
			stock:       40,
			imageURL:    "https://example.com/images/apres-rasage.jpg",
			category:    "Homme",
		},
	}

	for _, prod := range products {
		existingProd, err := client.Product.FindUnique(
			db.Product.Name.Equals(prod.name),
		).Exec(ctx)

		if err != nil || existingProd == nil {
			categoryID := categoryMap[prod.category]

			// Construire les paramètres - Name et Price doivent être en premier
			createParams := []db.ProductSetParam{
				db.Product.Name.Set(prod.name),
				db.Product.Price.Set(prod.price),
				db.Product.Stock.Set(prod.stock),
			}

			if prod.description != "" {
				createParams = append(createParams, db.Product.Description.Set(prod.description))
			}

			if prod.imageURL != "" {
				createParams = append(createParams, db.Product.ImageURL.Set(prod.imageURL))
			}

			if categoryID != "" {
				createParams = append(createParams, db.Product.Category.Link(db.Category.ID.Equals(categoryID)))
			}

			// Créer le produit - Name et Price en premier, puis les autres paramètres
			product, err := client.Product.CreateOne(
				db.Product.Name.Set(prod.name),
				db.Product.Price.Set(prod.price),
				createParams[2:]...,
			).Exec(ctx)

			if err != nil {
				log.Printf("  ⚠️  Erreur lors de la création du produit %s: %v", prod.name, err)
				continue
			}
			log.Printf("  ✅ Produit créé: %s (ID: %s) - %.2f€", prod.name, product.ID, prod.price)
		} else {
			log.Printf("  ℹ️  Produit existe déjà: %s (ID: %s)", prod.name, existingProd.ID)
		}
	}

	log.Println("\n✨ Initialisation terminée!")
	log.Printf("\n📝 Compte admin pour tester:")
	log.Printf("   Email: %s", adminEmail)
	log.Printf("   Password: %s", adminPassword)
	log.Printf("   Rôle: ADMIN\n")
}
