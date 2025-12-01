/**
 * TYPES API - Définitions TypeScript basées sur les DTOs Go du backend
 * 
 * Ces types correspondent exactement aux structures de données
 * retournées et acceptées par l'API backend.
 */

// ============================================
// TYPES UTILITAIRES
// ============================================

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

// ============================================
// TYPES UTILISATEUR (User)
// ============================================

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string; // Nouveau refresh token (rotation)
}

// ============================================
// TYPES CATÉGORIE (Category)
// ============================================

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
}

export interface PatchCategoryRequest {
  name?: string;
}

// ============================================
// TYPES PRODUIT (Product)
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageURL: string;
  categoryID?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageURL: string;
  categoryID?: string;
}

export interface PatchProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageURL?: string;
  categoryID?: string | null;
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// TYPES AVIS (Review)
// ============================================

export interface Review {
  id: string;
  rating: number; // 1-5
  comment?: string | null;
  userID: string;
  userEmail: string;
  productID: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productID: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number; // 1-5
  comment?: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

// ============================================
// TYPES COMMANDE (Order)
// ============================================

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  userID: string;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  productID: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

