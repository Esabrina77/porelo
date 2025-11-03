package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"context"
	"fmt"
)

// GetAllCategories récupère toutes les catégories
func GetAllCategories(client *db.PrismaClient) ([]dtos.CategoryResponse, error) {
	ctx := context.Background()

	categories, err := client.Category.FindMany().Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des catégories: %w", err)
	}

	result := make([]dtos.CategoryResponse, len(categories))
	for i, c := range categories {
		result[i] = dtos.CategoryResponse{
			ID:        c.ID,
			Name:      c.Name,
			CreatedAt: c.CreatedAt,
			UpdatedAt: c.UpdatedAt,
		}
	}

	return result, nil
}

// GetCategoryByID récupère une catégorie par son ID
func GetCategoryByID(client *db.PrismaClient, categoryID string) (*dtos.CategoryResponse, error) {
	ctx := context.Background()

	category, err := client.Category.FindUnique(
		db.Category.ID.Equals(categoryID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération de la catégorie: %w", err)
	}

	if category == nil {
		return nil, nil
	}

	return &dtos.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}, nil
}

// CreateCategory crée une nouvelle catégorie
func CreateCategory(client *db.PrismaClient, req dtos.CategoryRequest) (*dtos.CategoryResponse, error) {
	ctx := context.Background()

	// Vérifier si le nom existe déjà
	existingCategory, err := client.Category.FindUnique(
		db.Category.Name.Equals(req.Name),
	).Exec(ctx)
	if err == nil && existingCategory != nil {
		return nil, fmt.Errorf("une catégorie avec ce nom existe déjà")
	}

	category, err := client.Category.CreateOne(
		db.Category.Name.Set(req.Name),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création de la catégorie: %w", err)
	}

	return &dtos.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}, nil
}

// UpdateCategory met à jour une catégorie
func UpdateCategory(client *db.PrismaClient, categoryID string, req dtos.CategoryRequest) (*dtos.CategoryResponse, error) {
	ctx := context.Background()

	// Vérifier que la catégorie existe
	existingCategory, err := client.Category.FindUnique(
		db.Category.ID.Equals(categoryID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("catégorie non trouvée")
	}

	// Vérifier si le nouveau nom est déjà utilisé par une autre catégorie
	if req.Name != existingCategory.Name {
		nameExists, _ := client.Category.FindUnique(
			db.Category.Name.Equals(req.Name),
		).Exec(ctx)
		if nameExists != nil {
			return nil, fmt.Errorf("une catégorie avec ce nom existe déjà")
		}
	}

	category, err := client.Category.FindUnique(
		db.Category.ID.Equals(categoryID),
	).Update(
		db.Category.Name.Set(req.Name),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour de la catégorie: %w", err)
	}

	return &dtos.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}, nil
}

// DeleteCategory supprime une catégorie
func DeleteCategory(client *db.PrismaClient, categoryID string) error {
	ctx := context.Background()

	_, err := client.Category.FindUnique(
		db.Category.ID.Equals(categoryID),
	).Delete().Exec(ctx)
	if err != nil {
		return fmt.Errorf("erreur lors de la suppression de la catégorie: %w", err)
	}

	return nil
}
