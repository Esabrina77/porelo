/**
 * CLIENT API CENTRALISÉ
 * 
 * Ce client gère toutes les communications HTTP avec le backend.
 * Il ajoute automatiquement le token JWT aux requêtes authentifiées
 * et gère les erreurs de manière cohérente.
 */

import { ApiError } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Récupère l'access token depuis le localStorage
 */
function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

/**
 * Récupère le refresh token depuis le localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
}

/**
 * Stocke les tokens dans le localStorage
 */
function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }
}

/**
 * Supprime les tokens du localStorage
 */
function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userToken'); // Ancien token pour compatibilité
  }
}

/**
 * Rafraîchit l'access token en utilisant le refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token invalide ou expiré
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error('Erreur lors du refresh du token:', error);
    clearTokens();
    return null;
  }
}

/**
 * Gère les erreurs de réponse HTTP
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  let data: any;
  
  if (isJson) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : { message: 'Une erreur est survenue' };
  }

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || data.error || `Erreur HTTP ${response.status}`,
      error: data.error,
      statusCode: response.status,
    };

    // Gestion spécifique des erreurs d'authentification
    if (response.status === 401) {
      error.message = 'Session expirée. Veuillez vous reconnecter.';
      // Le refresh sera géré dans apiRequest
    } else if (response.status === 403) {
      error.message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }

    throw error;
  }

  return data as T;
}

/**
 * Options pour les requêtes API
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Effectue une requête HTTP vers l'API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
  } = options;

  // Construction de l'URL
  const url = `${API_URL}${endpoint}`;

  // Préparation des headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Ajout du token si nécessaire
  if (requiresAuth) {
    let token = getAccessToken();
    if (!token) {
      throw new Error('Token manquant pour l\'authentification');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Préparation du body
  let requestBody: string | undefined;
  if (body) {
    requestBody = JSON.stringify(body);
  }

  try {
    let response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });

    // Si 401 et authentification requise, essayer de rafraîchir le token
    if (response.status === 401 && requiresAuth) {
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        // Réessayer la requête avec le nouveau token
        requestHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: requestBody,
        });
      } else {
        // Refresh échoué, rediriger vers login
        if (typeof window !== 'undefined') {
          clearTokens();
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
        throw {
          message: 'Session expirée. Veuillez vous reconnecter.',
          statusCode: 401,
        } as ApiError;
      }
    }

    return await handleResponse<T>(response);
  } catch (error) {
    // Si c'est déjà une ApiError, on la propage
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    
    // Sinon, on crée une nouvelle erreur
    throw {
      message: error instanceof Error ? error.message : 'Une erreur réseau est survenue',
      statusCode: 0,
    } as ApiError;
  }
}

/**
 * Méthodes utilitaires pour les différents types de requêtes
 */
export const apiClient = {
  get: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'GET', requiresAuth }),

  post: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth }),

  put: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth }),

  patch: <T>(endpoint: string, body?: any, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth }),

  delete: <T>(endpoint: string, requiresAuth = true) =>
    apiRequest<T>(endpoint, { method: 'DELETE', requiresAuth }),
};

