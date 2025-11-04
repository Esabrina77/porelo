/**
 * TYPES - Définitions TypeScript pour toute l'application
 * 
 * Ce fichier contient tous les types et interfaces utilisés dans l'application.
 * Cela permet d'avoir une seule source de vérité pour la structure des données.
 */

// ============================================
// TYPES D'AUTHENTIFICATION
// ============================================

/**
 * Données utilisateur retournées par l'API
 * (Note: Le mot de passe n'est jamais inclus pour des raisons de sécurité)
 */
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

/**
 * Données nécessaires pour s'inscrire (créer un compte)
 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Données nécessaires pour se connecter
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Réponse après login ou register
 * Contient le token JWT et les informations utilisateur
 */
export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// TYPES DE PRODUITS
// ============================================

/**
 * Catégorie de produit
 */
export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Produit de soin (skincare)
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageURL?: string;
  categoryID?: string;
  category?: Category;
}

/**
 * Réponse paginée de produits
 */
export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Avis utilisateur sur un produit
 */
export interface Review {
  id: string;
  rating: number; // 1-5
  comment?: string;
  userID: string;
  userEmail: string;
  productID: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Requête pour créer un avis
 */
export interface CreateReviewRequest {
  productID: string;
  rating: number; // 1-5
  comment?: string;
}

/**
 * Requête pour mettre à jour un avis
 */
export interface UpdateReviewRequest {
  rating?: number; // 1-5
  comment?: string;
}

/**
 * Réponse avec tous les avis d'un produit et statistiques
 */
export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

/**
 * Données nécessaires pour créer ou modifier un produit
 */
export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageURL?: string;
  categoryID?: string;
}

// ============================================
// TYPES DE COMMANDES
// ============================================

/**
 * Statut d'une commande
 */
export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

/**
 * Article d'une commande (un produit avec quantité et prix)
 */
export interface OrderItem {
  id: string;
  quantity: number;
  price: number; // Prix au moment de la commande (snapshot)
  product: Product;
}

/**
 * Commande complète
 */
export interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  status: OrderStatus;
  userID: string;
  orderItems: OrderItem[];
}

/**
 * Données nécessaires pour créer une commande
 */
export interface CreateOrderRequest {
  items: {
    productID: string;
    quantity: number;
  }[];
}

/**
 * Données pour mettre à jour le statut d'une commande (admin seulement)
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ============================================
// TYPES D'ERREUR API
// ============================================

/**
 * Structure d'erreur retournée par l'API
 */
export interface ApiError {
  error: string;
  message?: string;
}

