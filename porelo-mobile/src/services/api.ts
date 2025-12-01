/**
 * SERVICE API - Client HTTP pour communiquer avec le backend
 * 
 * Ce service centralise toutes les communications avec l'API backend.
 * Il gère automatiquement :
 * - L'ajout du token JWT dans les requêtes authentifiées
 * - La gestion des erreurs
 * - La conversion des données JSON
 * 
 * BASE_URL: URL de votre backend (changez-la selon votre configuration)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  Product,
  ProductRequest,
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  Category,
  ApiError,
  PaginatedProductsResponse,
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  ProductReviewsResponse,
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

/**
 * CONFIGURATION RAPIDE POUR LE DÉVELOPPEMENT
 * 
 * Pour trouver votre IP locale (nécessaire pour téléphone physique) :
 * - Windows : Ouvrez PowerShell et tapez : ipconfig
 *   Cherchez "Adresse IPv4" sous "Carte réseau sans fil Wi-Fi" ou "Ethernet"
 *   Exemple : 192.168.1.100
 * 
 * - Mac/Linux : Ouvrez Terminal et tapez : ifconfig | grep "inet "
 *   Cherchez l'IP qui commence par 192.168.x.x ou 10.0.x.x
 * 
 * IMPORTANT : Remplacez l'IP ci-dessous par VOTRE IP locale !
 */
const DEV_API_IP = '10.15.3.89'; // IP de votre machine (trouvée via Metro Expo)
const DEV_API_PORT = '8080';

/**
 * Configuration de l'URL de l'API
 */
const getDefaultBaseURL = (): string => {
  // En production, utiliser l'URL de production
  if (!__DEV__) {
    return 'https://api.porelo.com';
  }
  
  // En développement
  if (Platform.OS === 'android') {
    // Pour Android : utiliser l'IP locale configurée ci-dessus
    // Si vous utilisez l'émulateur, changez DEV_API_IP en '10.0.2.2'
    return `http://${DEV_API_IP}:${DEV_API_PORT}`;
  } else if (Platform.OS === 'ios') {
    // iOS Simulator peut utiliser localhost
    return `http://localhost:${DEV_API_PORT}`;
  } else {
    // Web
    return `http://localhost:${DEV_API_PORT}`;
  }
};

// Log de l'URL utilisée pour le debug
const BASE_URL = getDefaultBaseURL();

console.log('========================================');
console.log('[API] Configuration:');
console.log('[API] Base URL:', BASE_URL);
console.log('[API] Plateforme:', Platform.OS);
console.log('[API] Mode:', __DEV__ ? 'DEVELOPPEMENT' : 'PRODUCTION');
if (__DEV__ && Platform.OS === 'android') {
  console.log('[API] ⚠️  IP configurée:', DEV_API_IP);
  console.log('[API] 💡 Si ça ne fonctionne pas, vérifiez que cette IP est correcte !');
}
console.log('========================================');

// Timeout des requêtes (en millisecondes)
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10);

// Clé utilisée pour stocker le token dans AsyncStorage
const TOKEN_STORAGE_KEY = process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY || '@porelo:token';

// ============================================
// CLIENT AXIOS
// ============================================

/**
 * Création du client axios avec configuration de base
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

/**
 * Routes publiques qui ne nécessitent pas de token JWT
 */
const PUBLIC_ROUTES = ['/auth/login', '/auth/register'];

/**
 * Intercepteur de requête : ajoute automatiquement le token JWT
 * 
 * Avant chaque requête, on vérifie si on a un token stocké.
 * Si oui, on l'ajoute dans le header Authorization.
 * 
 * IMPORTANT: Les routes publiques (/auth/login, /auth/register) ne doivent PAS recevoir de token.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const fullURL = `${BASE_URL}${url}`;
    const method = config.method?.toUpperCase() || 'GET';
    
    console.log('----------------------------------------');
    console.log(`[API] → ${method} ${fullURL}`);
    
    // Vérifier si c'est une route publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => url.includes(route));
    
    if (isPublicRoute) {
      console.log('[API] Route publique - pas de token nécessaire');
      console.log('[API] Body:', config.data ? JSON.stringify(config.data) : 'aucun');
      console.log('----------------------------------------');
      return config;
    }
    
    // Pour les routes protégées, ajouter le token si disponible
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (token) {
      // Ajouter le token dans le header Authorization
      // Format: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token ajouté à la requête');
    } else {
      console.warn('[API] ⚠️  Aucun token trouvé pour la requête protégée');
    }
    
    console.log('----------------------------------------');
    return config;
  },
  (error) => {
    console.error('[API] Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse : gère les erreurs globalement
 * 
 * Si on reçoit une erreur 401 (non autorisé), cela signifie que le token
 * est invalide ou expiré. On supprime le token et on pourrait rediriger
 * vers l'écran de login.
 * 
 * NOTE: Ne pas supprimer le token pour les routes d'authentification (/auth/login, /auth/register)
 * car ces routes ne nécessitent pas de token et peuvent retourner 401 pour d'autres raisons.
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('----------------------------------------');
    console.log(`[API] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('[API] Réponse reçue avec succès');
    console.log('----------------------------------------');
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    
    // Gestion des erreurs réseau (pas de réponse du serveur)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('[API] Timeout - Le serveur ne répond pas dans les temps:', url);
        error.message = 'Le serveur ne répond pas. Vérifiez votre connexion et que le backend est lancé.';
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.error('[API] Erreur réseau - Impossible de se connecter au serveur:', BASE_URL);
        console.error('[API] Vérifiez que le backend est lancé et accessible depuis', Platform.OS);
        
        if (Platform.OS === 'android') {
          const instructions = `❌ Impossible de se connecter au serveur (${BASE_URL})

📱 Pour un téléphone physique Android :
1. Trouvez votre IP locale :
   - Windows : Ouvrez PowerShell → tapez "ipconfig"
   - Cherchez "Adresse IPv4" (ex: 192.168.1.100)
   
2. Modifiez DEV_API_IP dans src/services/api.ts :
   const DEV_API_IP = 'VOTRE_IP_ICI';
   
3. Assurez-vous que :
   ✓ Le backend est lancé (go run main.go ou fresh)
   ✓ Le téléphone et votre PC sont sur le même réseau Wi-Fi
   ✓ Le firewall Windows autorise le port 8080

📱 Pour l'émulateur Android :
   Changez DEV_API_IP en '10.0.2.2' dans api.ts`;
          
          error.message = instructions;
        } else {
          error.message = `Impossible de se connecter au serveur (${BASE_URL}).\n\nVérifiez que:\n1. Le backend est lancé\n2. L'URL est correcte\n3. Vous êtes sur le même réseau`;
        }
      } else {
        console.error('[API] Erreur réseau inconnue:', error.message, error.code);
        error.message = error.message || 'Erreur de connexion réseau';
      }
      return Promise.reject(error);
    }
    
    // Gestion des erreurs HTTP
    const status = error.response.status;
    const errorData = error.response.data;
    
    console.error(`[API] Erreur ${status} ${method} ${url}:`, errorData);
    
    // Si erreur 401 (non autorisé), le token est invalide
    if (status === 401) {
      // Ne pas supprimer le token pour les routes d'authentification
      // Ne pas supprimer le token pour les routes reviews/me qui peuvent retourner 401 (pas encore d'avis)
      if (!url.includes('/auth/login') && 
          !url.includes('/auth/register') &&
          !url.includes('/reviews/me')) {
        // Supprimer le token invalide pour les vraies erreurs d'authentification
        console.error('[API] Erreur 401 - Token invalide ou expiré pour:', url);
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        console.log('[API] Token supprimé - déconnexion requise');
      }
    }
    
    // Améliorer le message d'erreur pour les erreurs 500
    if (status === 500) {
      error.message = 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// SERVICE D'AUTHENTIFICATION
// ============================================

/**
 * Service API pour l'authentification
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * 
   * @param data - Email et mot de passe
   * @returns Token JWT et données utilisateur
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    // Sauvegarder le token automatiquement après inscription
    if (response.data.token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    
    return response.data;
  },

  /**
   * Connexion d'un utilisateur existant
   * 
   * @param data - Email et mot de passe
   * @returns Token JWT et données utilisateur
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // Sauvegarder le token automatiquement après connexion
    if (response.data.token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    return response.data;
  },

  /**
   * Déconnexion : supprime le token
   */
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   * 
   * Requiert un token valide (ajouté automatiquement par l'intercepteur)
   * 
   * @returns Données utilisateur
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Vérifier si un utilisateur est connecté (a un token)
   * 
   * @returns true si un token existe
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return token !== null;
  },

  /**
   * Récupérer le token actuel (utile pour debug)
   */
  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  },
};

// ============================================
// SERVICE DE PRODUITS
// ============================================

/**
 * Service API pour les produits
 */
export const productService = {
  /**
   * Récupérer tous les produits (sans pagination - compatibilité)
   * 
   * Requiert authentification (token JWT)
   * 
   * @returns Liste de tous les produits
   */
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  /**
   * Récupérer les produits avec pagination
   * 
   * Requiert authentification (token JWT)
   * 
   * @param page - Numéro de page (commence à 1)
   * @param limit - Nombre d'éléments par page (défaut: 10, max: 100)
   * @returns Réponse paginée avec produits et métadonnées
   */
  getPaginated: async (page: number = 1, limit: number = 10): Promise<PaginatedProductsResponse> => {
    try {
      const response = await apiClient.get<PaginatedProductsResponse | Product[]>(`/products?page=${page}&limit=${limit}`);
      const data = response.data;
      
      // Vérifier que la réponse a le bon format paginé
      if (data && typeof data === 'object' && 'products' in data) {
        return data as PaginatedProductsResponse;
      }
      
      // Si la réponse est directement un tableau (ancienne API), convertir en format paginé
      if (Array.isArray(data)) {
        return {
          products: data,
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        };
      }
      
      throw new Error('Format de réponse inattendu');
    } catch (error: any) {
      // Si l'endpoint paginé échoue (sauf 401), essayer l'ancien endpoint
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        try {
          const allProducts = await productService.getAll();
          return {
            products: allProducts,
            total: allProducts.length,
            page: 1,
            limit: allProducts.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          };
        } catch (fallbackError) {
          throw error;
        }
      }
      throw error;
    }
  },

  /**
   * Récupérer un produit par son ID
   * 
   * @param id - ID du produit
   * @returns Données du produit
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau produit (admin seulement)
   * 
   * @param data - Données du produit à créer
   * @returns Produit créé
   */
  create: async (data: ProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/admin/products', data);
    return response.data;
  },

  /**
   * Mettre à jour un produit (admin seulement)
   * 
   * @param id - ID du produit à modifier
   * @param data - Nouvelles données
   * @returns Produit modifié
   */
  update: async (id: string, data: ProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un produit (admin seulement)
   * 
   * @param id - ID du produit à supprimer
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },
};

// ============================================
// SERVICE D'AVIS (REVIEWS)
// ============================================

/**
 * Service API pour les avis sur les produits
 */
export const reviewService = {
  /**
   * Récupérer tous les avis d'un produit avec statistiques
   * 
   * @param productID - ID du produit
   * @returns Tous les avis avec moyenne et total
   */
  getProductReviews: async (productID: string): Promise<ProductReviewsResponse> => {
    const response = await apiClient.get<ProductReviewsResponse>(`/products/${productID}/reviews`);
    return response.data;
  },

  /**
   * Récupérer l'avis de l'utilisateur connecté pour un produit
   * 
   * @param productID - ID du produit
   * @returns L'avis de l'utilisateur ou null si aucun avis
   */
  getMyReview: async (productID: string): Promise<Review | null> => {
    try {
      const response = await apiClient.get<Review>(`/products/${productID}/reviews/me`);
      return response.data;
    } catch (error: any) {
      // 404 signifie qu'il n'y a pas encore d'avis pour cet utilisateur
      // 401 signifie que l'utilisateur n'est pas authentifié ou que la route nécessite auth
      if (error.response?.status === 404 || error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Créer ou mettre à jour un avis pour un produit
   * 
   * @param productID - ID du produit
   * @param reviewData - Données de l'avis (note et commentaire)
   * @returns L'avis créé ou mis à jour
   */
  createOrUpdateReview: async (productID: string, reviewData: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<Review>(`/products/${productID}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Mettre à jour un avis existant
   * 
   * @param reviewID - ID de l'avis
   * @param reviewData - Données de mise à jour
   * @returns L'avis mis à jour
   */
  updateReview: async (reviewID: string, reviewData: UpdateReviewRequest): Promise<Review> => {
    const response = await apiClient.put<Review>(`/reviews/${reviewID}`, reviewData);
    return response.data;
  },

  /**
   * Supprimer un avis
   * 
   * @param reviewID - ID de l'avis
   */
  deleteReview: async (reviewID: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewID}`);
  },
};

// ============================================
// SERVICE DE COMMANDES
// ============================================

/**
 * Service API pour les commandes
 */
export const orderService = {
  /**
   * Créer une nouvelle commande
   * 
   * @param data - Liste des produits avec quantités
   * @returns Commande créée
   */
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  },

  /**
   * Récupérer toutes les commandes de l'utilisateur connecté
   * 
   * @returns Liste des commandes de l'utilisateur
   */
  getUserOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  /**
   * Récupérer une commande par son ID
   * 
   * @param id - ID de la commande
   * @returns Données de la commande
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Récupérer toutes les commandes (admin seulement)
   * 
   * @returns Liste de toutes les commandes
   */
  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/admin/orders');
    return response.data;
  },

  /**
   * Mettre à jour le statut d'une commande (admin seulement)
   * 
   * @param id - ID de la commande
   * @param data - Nouveau statut
   * @returns Commande mise à jour
   */
  updateStatus: async (id: string, data: UpdateOrderStatusRequest): Promise<Order> => {
    const response = await apiClient.put<Order>(`/admin/orders/${id}/status`, data);
    return response.data;
  },
};

// ============================================
// SERVICE DE CATÉGORIES (ADMIN ONLY)
// ============================================

/**
 * Service API pour les catégories (admin seulement)
 */
export const categoryService = {
  /**
   * Récupérer toutes les catégories
   * 
   * @returns Liste de toutes les catégories
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/admin/categories');
    return response.data;
  },

  /**
   * Récupérer une catégorie par son ID
   * 
   * @param id - ID de la catégorie
   * @returns Données de la catégorie
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/admin/categories/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle catégorie
   * 
   * @param data - Nom de la catégorie
   * @returns Catégorie créée
   */
  create: async (data: { name: string }): Promise<Category> => {
    const response = await apiClient.post<Category>('/admin/categories', data);
    return response.data;
  },

  /**
   * Mettre à jour une catégorie
   * 
   * @param id - ID de la catégorie
   * @param data - Nouveau nom
   * @returns Catégorie modifiée
   */
  update: async (id: string, data: { name: string }): Promise<Category> => {
    const response = await apiClient.put<Category>(`/admin/categories/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une catégorie
   * 
   * @param id - ID de la catégorie à supprimer
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};

// Export du client pour des cas spéciaux
export default apiClient;

