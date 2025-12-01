/**
 * SERVICE COMMANDES
 * 
 * Gère toutes les opérations liées aux commandes :
 * - Création d'une commande
 * - Liste des commandes de l'utilisateur
 * - Détails d'une commande
 * - Mise à jour du statut (admin)
 */

import { apiClient } from '../apiClient';
import {
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from '../types';

/**
 * Crée une nouvelle commande
 */
export async function createOrder(
  order: CreateOrderRequest
): Promise<Order> {
  return apiClient.post<Order>('/orders', order);
}

/**
 * Récupère toutes les commandes de l'utilisateur connecté
 */
export async function getUserOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/orders');
}

/**
 * Récupère une commande par son ID
 */
export async function getOrderById(id: string): Promise<Order> {
  return apiClient.get<Order>(`/orders/${id}`);
}

/**
 * Récupère toutes les commandes (admin uniquement)
 */
export async function getAllOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/admin/orders');
}

/**
 * Met à jour le statut d'une commande (admin uniquement)
 */
export async function updateOrderStatus(
  id: string,
  status: UpdateOrderStatusRequest
): Promise<Order> {
  return apiClient.put<Order>(`/admin/orders/${id}/status`, status);
}

