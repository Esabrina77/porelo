/**
 * SERVICE UTILISATEURS
 * 
 * Gère les opérations liées aux utilisateurs
 */

import { apiClient } from '../apiClient';
import { User } from '../types';

/**
 * Récupère un utilisateur par son ID
 */
export async function getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/user/${id}`);
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/user/${id}`, data);
}

/**
 * Récupère tous les utilisateurs (admin uniquement)
 */
export async function getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/users');
}

/**
 * Supprime un utilisateur (admin uniquement)
 */
export async function deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/user/${id}`);
}
