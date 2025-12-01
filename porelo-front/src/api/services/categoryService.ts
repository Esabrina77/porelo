/**
 * SERVICE CATÉGORIES
 * 
 * Gère toutes les opérations liées aux catégories :
 * - Liste des catégories
 * - Détails d'une catégorie
 * - Création, modification, suppression (admin)
 */

import { apiClient } from '../apiClient';
import {
  Category,
  CategoryRequest,
  PatchCategoryRequest,
} from '../types';

/**
 * Récupère toutes les catégories
 */
export async function getAllCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>('/admin/categories');
}

/**
 * Récupère une catégorie par son ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  return apiClient.get<Category>(`/admin/categories/${id}`);
}

/**
 * Crée une nouvelle catégorie (admin uniquement)
 */
export async function createCategory(
  category: CategoryRequest
): Promise<Category> {
  return apiClient.post<Category>('/admin/categories', category);
}

/**
 * Met à jour une catégorie (admin uniquement)
 */
export async function updateCategory(
  id: string,
  category: PatchCategoryRequest
): Promise<Category> {
  return apiClient.patch<Category>(`/admin/categories/${id}`, category);
}

/**
 * Supprime une catégorie (admin uniquement)
 */
export async function deleteCategory(id: string): Promise<void> {
  return apiClient.delete<void>(`/admin/categories/${id}`);
}

