package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"context"
	"fmt"
)

// GetAllProducts récupère tous les produits
// NOTE: Vous devez d'abord exécuter: npx prisma generate pour régénérer le client
func GetAllProducts(client *db.PrismaClient) ([]dtos.ProductResponse, error) {
	ctx := context.Background()

	products, err := client.Product.FindMany().With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des produits: %w", err)
	}

	result := make([]dtos.ProductResponse, len(products))
	for i, p := range products {
		var description string
		if desc, ok := p.Description(); ok {
			description = string(desc)
		}

		var imageURL string
		if img, ok := p.ImageURL(); ok {
			imageURL = string(img)
		}

		var categoryID *string
		var category *dtos.CategoryResponse

		if catID, ok := p.CategoryID(); ok {
			categoryID = &catID
			if cat, ok := p.Category(); ok && cat != nil {
				category = &dtos.CategoryResponse{
					ID:        cat.ID,
					Name:      cat.Name,
					CreatedAt: cat.CreatedAt,
					UpdatedAt: cat.UpdatedAt,
				}
			}
		}

		result[i] = dtos.ProductResponse{
			ID:          p.ID,
			Name:        p.Name,
			Description: description,
			Price:       p.Price,
			Stock:       p.Stock,
			ImageURL:    imageURL,
			CategoryID:  categoryID,
			Category:    category,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		}
	}

	return result, nil
}

// GetProductByID récupère un produit par son ID
func GetProductByID(client *db.PrismaClient, productID string) (*dtos.ProductResponse, error) {
	ctx := context.Background()

	product, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du produit: %w", err)
	}

	if product == nil {
		return nil, nil
	}

	var description string
	if desc, ok := product.Description(); ok {
		description = string(desc)
	}

	var imageURL string
	if img, ok := product.ImageURL(); ok {
		imageURL = string(img)
	}

	var categoryID *string
	var category *dtos.CategoryResponse

	if catID, ok := product.CategoryID(); ok {
		categoryID = &catID
		if cat, ok := product.Category(); ok && cat != nil {
			category = &dtos.CategoryResponse{
				ID:        cat.ID,
				Name:      cat.Name,
				CreatedAt: cat.CreatedAt,
				UpdatedAt: cat.UpdatedAt,
			}
		}
	}

	return &dtos.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: description,
		Price:       product.Price,
		Stock:       product.Stock,
		ImageURL:    imageURL,
		CategoryID:  categoryID,
		Category:    category,
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
	}, nil
}

// CreateProduct crée un nouveau produit
func CreateProduct(client *db.PrismaClient, req dtos.ProductRequest) (*dtos.ProductResponse, error) {
	ctx := context.Background()

	// Vérifier si le nom existe déjà
	existingProduct, err := client.Product.FindUnique(
		db.Product.Name.Equals(req.Name),
	).Exec(ctx)
	if err == nil && existingProduct != nil {
		return nil, fmt.Errorf("un produit avec ce nom existe déjà")
	}

	// Préparer les options de création
	var createParams []db.ProductSetParam
	createParams = append(createParams,
		db.Product.Name.Set(req.Name),
		db.Product.Price.Set(req.Price),
		db.Product.Stock.Set(req.Stock),
	)

	if req.Description != "" {
		createParams = append(createParams, db.Product.Description.Set(req.Description))
	}
	if req.ImageURL != "" {
		createParams = append(createParams, db.Product.ImageURL.Set(req.ImageURL))
	}
	if req.CategoryID != "" {
		// Vérifier que la catégorie existe
		_, err := client.Category.FindUnique(
			db.Category.ID.Equals(req.CategoryID),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("catégorie non trouvée")
		}
		createParams = append(createParams, db.Product.Category.Link(db.Category.ID.Equals(req.CategoryID)))
	}

	product, err := client.Product.CreateOne(
		db.Product.Name.Set(req.Name),
		db.Product.Price.Set(req.Price),
		createParams[2:]...,
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création du produit: %w", err)
	}

	// Récupérer le produit avec la catégorie
	product, err = client.Product.FindUnique(
		db.Product.ID.Equals(product.ID),
	).With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du produit: %w", err)
	}

	var description string
	if desc, ok := product.Description(); ok {
		description = string(desc)
	}

	var imageURL string
	if img, ok := product.ImageURL(); ok {
		imageURL = string(img)
	}

	var categoryID *string
	var category *dtos.CategoryResponse

	if catID, ok := product.CategoryID(); ok {
		categoryID = &catID
		if cat, ok := product.Category(); ok && cat != nil {
			category = &dtos.CategoryResponse{
				ID:        cat.ID,
				Name:      cat.Name,
				CreatedAt: cat.CreatedAt,
				UpdatedAt: cat.UpdatedAt,
			}
		}
	}

	return &dtos.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: description,
		Price:       product.Price,
		Stock:       product.Stock,
		ImageURL:    imageURL,
		CategoryID:  categoryID,
		Category:    category,
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
	}, nil
}

// UpdateProduct met à jour un produit
func UpdateProduct(client *db.PrismaClient, productID string, req dtos.ProductRequest) (*dtos.ProductResponse, error) {
	ctx := context.Background()

	// Vérifier que le produit existe
	existingProduct, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("produit non trouvé")
	}

	// Vérifier si le nouveau nom est déjà utilisé par un autre produit
	if req.Name != existingProduct.Name {
		nameExists, _ := client.Product.FindUnique(
			db.Product.Name.Equals(req.Name),
		).Exec(ctx)
		if nameExists != nil {
			return nil, fmt.Errorf("un produit avec ce nom existe déjà")
		}
	}

	// Préparer les options de mise à jour
	var updateOptions []db.ProductSetParam
	updateOptions = append(updateOptions,
		db.Product.Name.Set(req.Name),
		db.Product.Price.Set(req.Price),
		db.Product.Stock.Set(req.Stock),
	)

	if req.Description != "" {
		updateOptions = append(updateOptions, db.Product.Description.Set(req.Description))
	}

	if req.ImageURL != "" {
		updateOptions = append(updateOptions, db.Product.ImageURL.Set(req.ImageURL))
	}

	// Gérer la catégorie
	if req.CategoryID != "" {
		// Vérifier que la catégorie existe
		_, err := client.Category.FindUnique(
			db.Category.ID.Equals(req.CategoryID),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("catégorie non trouvée")
		}
		updateOptions = append(updateOptions, db.Product.Category.Link(db.Category.ID.Equals(req.CategoryID)))
	} else {
		updateOptions = append(updateOptions, db.Product.Category.Unlink())
	}

	_, err = client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Update(updateOptions...).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour du produit: %w", err)
	}

	// Récupérer le produit mis à jour avec la catégorie
	product, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du produit: %w", err)
	}

	var description string
	if desc, ok := product.Description(); ok {
		description = string(desc)
	}

	var imageURL string
	if img, ok := product.ImageURL(); ok {
		imageURL = string(img)
	}

	var categoryID *string
	var category *dtos.CategoryResponse

	if catID, ok := product.CategoryID(); ok {
		categoryID = &catID
		if cat, ok := product.Category(); ok && cat != nil {
			category = &dtos.CategoryResponse{
				ID:        cat.ID,
				Name:      cat.Name,
				CreatedAt: cat.CreatedAt,
				UpdatedAt: cat.UpdatedAt,
			}
		}
	}

	return &dtos.ProductResponse{
		ID:          product.ID,
		Name:        product.Name,
		Description: description,
		Price:       product.Price,
		Stock:       product.Stock,
		ImageURL:    imageURL,
		CategoryID:  categoryID,
		Category:    category,
		CreatedAt:   product.CreatedAt,
		UpdatedAt:   product.UpdatedAt,
	}, nil
}

// DeleteProduct supprime un produit
func DeleteProduct(client *db.PrismaClient, productID string) error {
	ctx := context.Background()

	_, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Delete().Exec(ctx)
	if err != nil {
		return fmt.Errorf("erreur lors de la suppression du produit: %w", err)
	}

	return nil
}
