package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"context"
	"fmt"
	"math"
)

// GetAllProducts récupère tous les produits (sans pagination - pour compatibilité)
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

// GetProductsPaginated récupère les produits avec pagination
// page: numéro de page (commence à 1)
// limit: nombre d'éléments par page (défaut: 10, max: 100)
func GetProductsPaginated(client *db.PrismaClient, page, limit int) (*dtos.PaginatedProductsResponse, error) {
	ctx := context.Background()

	// Valider et ajuster les paramètres
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// Calculer le skip
	skip := (page - 1) * limit

	// Compter le total de produits
	total, err := client.Product.FindMany().Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors du comptage des produits: %w", err)
	}
	totalCount := len(total)

	// Récupérer les produits paginés
	// Note: Prisma Go utilise Take() et Skip() comme méthodes de chaînage
	query := client.Product.FindMany()

	// Appliquer Take et Skip
	if limit > 0 {
		query = query.Take(limit)
	}
	if skip > 0 {
		query = query.Skip(skip)
	}

	products, err := query.With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des produits: %w", err)
	}

	// Convertir en DTO
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

	// Calculer les métadonnées
	totalPages := int(math.Ceil(float64(totalCount) / float64(limit)))
	if totalPages == 0 {
		totalPages = 1
	}

	return &dtos.PaginatedProductsResponse{
		Products:   result,
		Total:      totalCount,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}, nil
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

// PatchProduct met à jour partiellement un produit (seuls les champs fournis sont mis à jour)
func PatchProduct(client *db.PrismaClient, productID string, req dtos.PatchProductRequest) (*dtos.ProductResponse, error) {
	ctx := context.Background()

	// Vérifier que le produit existe
	existingProduct, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("produit non trouvé")
	}

	// Préparer les options de mise à jour (seulement les champs fournis)
	updateParams := []db.ProductSetParam{}

	// Nom (si fourni)
	if req.Name != nil {
		// Vérifier si le nouveau nom est déjà utilisé par un autre produit
		if *req.Name != existingProduct.Name {
			nameExists, _ := client.Product.FindUnique(
				db.Product.Name.Equals(*req.Name),
			).Exec(ctx)
			if nameExists != nil {
				return nil, fmt.Errorf("un produit avec ce nom existe déjà")
			}
		}
		updateParams = append(updateParams, db.Product.Name.Set(*req.Name))
	}

	// Description (si fournie)
	if req.Description != nil {
		updateParams = append(updateParams, db.Product.Description.Set(*req.Description))
	}

	// Prix (si fourni)
	if req.Price != nil {
		if *req.Price <= 0 {
			return nil, fmt.Errorf("le prix doit être supérieur à 0")
		}
		updateParams = append(updateParams, db.Product.Price.Set(*req.Price))
	}

	// Stock (si fourni)
	if req.Stock != nil {
		if *req.Stock < 0 {
			return nil, fmt.Errorf("le stock ne peut pas être négatif")
		}
		updateParams = append(updateParams, db.Product.Stock.Set(*req.Stock))
	}

	// ImageURL (si fournie)
	if req.ImageURL != nil {
		updateParams = append(updateParams, db.Product.ImageURL.Set(*req.ImageURL))
	}

	// CategoryID (si fourni)
	if req.CategoryID != nil {
		// Si CategoryID est une chaîne vide ou null, on supprime la catégorie
		if *req.CategoryID == "" {
			updateParams = append(updateParams, db.Product.Category.Unlink())
		} else {
			// Vérifier que la catégorie existe
			category, err := client.Category.FindUnique(
				db.Category.ID.Equals(*req.CategoryID),
			).Exec(ctx)
			if err != nil || category == nil {
				return nil, fmt.Errorf("catégorie non trouvée")
			}
			updateParams = append(updateParams, db.Product.Category.Link(db.Category.ID.Equals(*req.CategoryID)))
		}
	}

	// Si aucun champ n'est fourni, retourner une erreur
	if len(updateParams) == 0 {
		return nil, fmt.Errorf("au moins un champ doit être fourni pour la mise à jour")
	}

	// Mettre à jour le produit
	product, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Update(updateParams...).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour du produit: %w", err)
	}

	// Récupérer le produit avec la catégorie
	product, err = client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).With(
		db.Product.Category.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération du produit: %w", err)
	}

	// Convertir en DTO
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
