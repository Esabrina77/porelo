/**
 * SERVICE PRODUITS
 * 
 * Gère toutes les opérations liées aux produits :
 * - Liste paginée des produits
 * - Détails d'un produit
 * - Création, modification, suppression (admin)
 */

import { apiClient } from '../apiClient';
import {
  Product,
  ProductRequest,
  PatchProductRequest,
  PaginatedProductsResponse,
} from '../types';

/**
 * Récupère la liste paginée des produits
 */
export async function fetchProducts(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProductsResponse> {
  return apiClient.get<PaginatedProductsResponse>(
    `/products?page=${page}&limit=${limit}`
  );
}

/**
 * Récupère les détails d'un produit par son ID
 */
export async function getProductById(id: string): Promise<Product> {
  return apiClient.get<Product>(`/products/${id}`);
}

/**
 * Crée un nouveau produit (admin uniquement)
 */
export async function createProduct(
  product: ProductRequest
): Promise<Product> {
  return apiClient.post<Product>('/admin/products', product);
}

/**
 * Met à jour un produit (admin uniquement)
 */
export async function updateProduct(
  id: string,
  product: PatchProductRequest
): Promise<Product> {
  return apiClient.patch<Product>(`/admin/products/${id}`, product);
}

/**
 * Supprime un produit (admin uniquement)
 */
export async function deleteProduct(id: string): Promise<void> {
  return apiClient.delete<void>(`/admin/products/${id}`);
}

/**
 * Recherche des produits par nom ou description
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProductsResponse> {
  return apiClient.get<PaginatedProductsResponse>(
    `/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
}

/**
 * Récupère les produits d'une catégorie
 */
export async function getProductsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedProductsResponse> {
  return apiClient.get<PaginatedProductsResponse>(
    `/products/category/${categoryId}?page=${page}&limit=${limit}`
  );
}

