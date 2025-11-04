package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"api/internal/utils"
	"context"
	"fmt"
	"math"
)

// CreateReview crée un nouvel avis pour un produit
func CreateReview(client *db.PrismaClient, userID string, req dtos.CreateReviewRequest) (*dtos.ReviewResponse, error) {
	ctx := context.Background()

	// Valider que le produit existe
	product, err := client.Product.FindUnique(
		db.Product.ID.Equals(req.ProductID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("produit non trouvé")
	}
	if product == nil {
		return nil, fmt.Errorf("produit non trouvé")
	}

	// Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
	// Utiliser FindFirst avec des conditions au lieu de FindUnique avec composite key
	existingReview, err := client.Review.FindFirst(
		db.Review.UserID.Equals(userID),
		db.Review.ProductID.Equals(req.ProductID),
	).Exec(ctx)

	// Si l'avis existe déjà, on le met à jour au lieu de créer un nouveau
	if err == nil && existingReview != nil {
		// Mettre à jour l'avis existant
		updateParams := []db.ReviewSetParam{
			db.Review.Rating.Set(req.Rating),
		}
		if req.Comment != nil {
			updateParams = append(updateParams, db.Review.Comment.Set(*req.Comment))
		} else {
			updateParams = append(updateParams, db.Review.Comment.Set(""))
		}

		review, err := client.Review.FindUnique(
			db.Review.ID.Equals(existingReview.ID),
		).Update(updateParams...).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la mise à jour de l'avis: %w", err)
		}

		// Récupérer l'utilisateur pour l'email
		user, err := client.User.FindUnique(
			db.User.ID.Equals(userID),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la récupération de l'utilisateur: %w", err)
		}

		var comment *string
		if commentVal, ok := review.Comment(); ok && commentVal != "" {
			commentStr := string(commentVal)
			comment = &commentStr
		}

		return &dtos.ReviewResponse{
			ID:        review.ID,
			Rating:    review.Rating,
			Comment:   comment,
			UserID:    review.UserID,
			UserEmail: utils.MaskEmail(user.Email),
			ProductID: review.ProductID,
			CreatedAt: review.CreatedAt,
			UpdatedAt: review.UpdatedAt,
		}, nil
	}

	// Créer un nouvel avis
	// Prisma Go nécessite l'ordre spécifique : Rating, User, Product, puis les autres champs
	var commentParam db.ReviewSetParam
	if req.Comment != nil && *req.Comment != "" {
		commentParam = db.Review.Comment.Set(*req.Comment)
	} else {
		commentParam = db.Review.Comment.Set("")
	}

	// Créer l'avis avec les paramètres dans l'ordre requis
	review, err := client.Review.CreateOne(
		db.Review.Rating.Set(req.Rating),
		db.Review.User.Link(db.User.ID.Equals(userID)),
		db.Review.Product.Link(db.Product.ID.Equals(req.ProductID)),
		commentParam,
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création de l'avis: %w", err)
	}

	// Récupérer l'utilisateur pour l'email
	user, err := client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération de l'utilisateur: %w", err)
	}

	var comment *string
	if commentVal, ok := review.Comment(); ok && commentVal != "" {
		commentStr := string(commentVal)
		comment = &commentStr
	}

	return &dtos.ReviewResponse{
		ID:        review.ID,
		Rating:    review.Rating,
		Comment:   comment,
		UserID:    review.UserID,
		UserEmail: utils.MaskEmail(user.Email),
		ProductID: review.ProductID,
		CreatedAt: review.CreatedAt,
		UpdatedAt: review.UpdatedAt,
	}, nil
}

// GetProductReviews récupère tous les avis d'un produit avec statistiques
func GetProductReviews(client *db.PrismaClient, productID string) (*dtos.ProductReviewsResponse, error) {
	ctx := context.Background()

	// Vérifier que le produit existe
	_, err := client.Product.FindUnique(
		db.Product.ID.Equals(productID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("produit non trouvé")
	}

	// Récupérer tous les avis du produit avec les utilisateurs
	reviews, err := client.Review.FindMany(
		db.Review.ProductID.Equals(productID),
	).With(
		db.Review.User.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des avis: %w", err)
	}

	// Convertir en DTOs et calculer la moyenne
	totalRating := 0
	result := make([]dtos.ReviewResponse, len(reviews))

	for i, review := range reviews {
		user := review.User()
		if user == nil {
			continue
		}

		totalRating += review.Rating

		var comment *string
		if commentVal, ok := review.Comment(); ok && commentVal != "" {
			commentStr := string(commentVal)
			comment = &commentStr
		}

		result[i] = dtos.ReviewResponse{
			ID:        review.ID,
			Rating:    review.Rating,
			Comment:   comment,
			UserID:    review.UserID,
			UserEmail: utils.MaskEmail(user.Email),
			ProductID: review.ProductID,
			CreatedAt: review.CreatedAt,
			UpdatedAt: review.UpdatedAt,
		}
	}

	// Calculer la moyenne
	var averageRating float64
	if len(reviews) > 0 {
		averageRating = float64(totalRating) / float64(len(reviews))
		// Arrondir à 1 décimale
		averageRating = math.Round(averageRating*10) / 10
	}

	return &dtos.ProductReviewsResponse{
		Reviews:       result,
		AverageRating: averageRating,
		TotalReviews:  len(reviews),
	}, nil
}

// GetUserReview récupère l'avis d'un utilisateur pour un produit spécifique
func GetUserReview(client *db.PrismaClient, userID, productID string) (*dtos.ReviewResponse, error) {
	ctx := context.Background()

	review, err := client.Review.FindFirst(
		db.Review.UserID.Equals(userID),
		db.Review.ProductID.Equals(productID),
	).With(
		db.Review.User.Fetch(),
	).Exec(ctx)
	if err != nil {
		return nil, nil // Pas d'avis trouvé, ce n'est pas une erreur
	}

	user := review.User()
	if user == nil {
		return nil, fmt.Errorf("utilisateur non trouvé")
	}

	var comment *string
	if commentVal, ok := review.Comment(); ok && commentVal != "" {
		commentStr := string(commentVal)
		comment = &commentStr
	}

	return &dtos.ReviewResponse{
		ID:        review.ID,
		Rating:    review.Rating,
		Comment:   comment,
		UserID:    review.UserID,
		UserEmail: utils.MaskEmail(user.Email),
		ProductID: review.ProductID,
		CreatedAt: review.CreatedAt,
		UpdatedAt: review.UpdatedAt,
	}, nil
}

// UpdateReview met à jour un avis existant
func UpdateReview(client *db.PrismaClient, reviewID, userID string, req dtos.UpdateReviewRequest) (*dtos.ReviewResponse, error) {
	ctx := context.Background()

	// Vérifier que l'avis existe et appartient à l'utilisateur
	review, err := client.Review.FindUnique(
		db.Review.ID.Equals(reviewID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("avis non trouvé")
	}

	if review.UserID != userID {
		return nil, fmt.Errorf("vous n'êtes pas autorisé à modifier cet avis")
	}

	// Préparer les paramètres de mise à jour
	var updateParams []db.ReviewSetParam

	if req.Rating != nil {
		updateParams = append(updateParams, db.Review.Rating.Set(*req.Rating))
	}

	if req.Comment != nil {
		updateParams = append(updateParams, db.Review.Comment.Set(*req.Comment))
	}

	if len(updateParams) == 0 {
		return nil, fmt.Errorf("aucune modification à effectuer")
	}

	// Mettre à jour l'avis
	updatedReview, err := client.Review.FindUnique(
		db.Review.ID.Equals(reviewID),
	).Update(updateParams...).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour de l'avis: %w", err)
	}

	// Récupérer l'utilisateur pour l'email
	user, err := client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération de l'utilisateur: %w", err)
	}

	var comment *string
	if commentVal, ok := updatedReview.Comment(); ok && commentVal != "" {
		commentStr := string(commentVal)
		comment = &commentStr
	}

	return &dtos.ReviewResponse{
		ID:        updatedReview.ID,
		Rating:    updatedReview.Rating,
		Comment:   comment,
		UserID:    updatedReview.UserID,
		UserEmail: utils.MaskEmail(user.Email),
		ProductID: updatedReview.ProductID,
		CreatedAt: updatedReview.CreatedAt,
		UpdatedAt: updatedReview.UpdatedAt,
	}, nil
}

// DeleteReview supprime un avis
func DeleteReview(client *db.PrismaClient, reviewID, userID string) error {
	ctx := context.Background()

	// Vérifier que l'avis existe et appartient à l'utilisateur
	review, err := client.Review.FindUnique(
		db.Review.ID.Equals(reviewID),
	).Exec(ctx)
	if err != nil {
		return fmt.Errorf("avis non trouvé")
	}

	if review.UserID != userID {
		return fmt.Errorf("vous n'êtes pas autorisé à supprimer cet avis")
	}

	// Supprimer l'avis
	_, err = client.Review.FindUnique(
		db.Review.ID.Equals(reviewID),
	).Delete().Exec(ctx)
	if err != nil {
		return fmt.Errorf("erreur lors de la suppression de l'avis: %w", err)
	}

	return nil
}
