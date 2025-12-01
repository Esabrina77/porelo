/**
 * SERVICE AVIS
 * 
 * Gère toutes les opérations liées aux avis :
 * - Création d'un avis
 * - Liste des avis d'un produit
 * - Modification/suppression de son propre avis
 */

import { apiClient } from '../apiClient';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ProductReviewsResponse,
} from '../types';

/**
 * Crée un nouvel avis sur un produit
 */
/**
 * Crée un nouvel avis sur un produit
 */
export async function createReview(
  review: CreateReviewRequest
): Promise<Review> {
  return apiClient.post<Review>(`/products/${review.productID}/reviews`, review);
}

/**
 * Récupère tous les avis d'un produit avec statistiques
 */
export async function getProductReviews(
  productId: string
): Promise<ProductReviewsResponse> {
  return apiClient.get<ProductReviewsResponse>(
    `/products/${productId}/reviews`
  );
}

/**
 * Récupère un avis par son ID
 */
export async function getReviewById(id: string): Promise<Review> {
  // Note: This endpoint might not exist in the backend based on the provided routes.
  // Assuming it might be needed or is a placeholder.
  // If it doesn't exist, this call will fail.
  return apiClient.get<Review>(`/reviews/${id}`, false);
}

/**
 * Met à jour un avis (propriétaire uniquement)
 */
export async function updateReview(
  id: string,
  review: UpdateReviewRequest
): Promise<Review> {
  return apiClient.put<Review>(`/reviews/${id}`, review);
}

/**
 * Supprime un avis (propriétaire uniquement)
 */
export async function deleteReview(id: string): Promise<void> {
  return apiClient.delete<void>(`/reviews/${id}`);
}

/**
 * Récupère l'avis de l'utilisateur pour un produit spécifique
 */
export async function getUserReviewForProduct(productId: string): Promise<Review> {
  return apiClient.get<Review>(`/products/${productId}/reviews/me`);
}

