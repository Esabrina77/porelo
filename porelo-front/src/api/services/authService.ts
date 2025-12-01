/**
 * SERVICE AUTHENTIFICATION
 * 
 * Gère toutes les opérations liées à l'authentification :
 * - Connexion
 * - Inscription
 * - Refresh token
 * - Logout
 * - Récupération de l'utilisateur actuel
 */

import { apiClient } from '../apiClient';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserRequest,
  User,
} from '../types';

/**
 * Connexion d'un utilisateur
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const request: LoginRequest = { email, password };
  return apiClient.post<LoginResponse>('/auth/login', request, false);
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function registerUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const request: UserRequest = { email, password };
  return apiClient.post<LoginResponse>('/auth/register', request, false);
}

/**
 * Rafraîchit l'access token en utilisant le refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const request: RefreshTokenRequest = { refreshToken };
  return apiClient.post<RefreshTokenResponse>('/auth/refresh', request, false);
}

/**
 * Déconnexion (révoque le refresh token)
 */
export async function logout(refreshToken: string): Promise<void> {
  const request: RefreshTokenRequest = { refreshToken };
  await apiClient.post<void>('/auth/logout', request, false);
}

/**
 * Déconnexion de tous les appareils (révoque tous les refresh tokens)
 */
export async function logoutAll(): Promise<void> {
  return apiClient.post<void>('/auth/logout-all', undefined, true);
}

/**
 * Récupère les informations de l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>('/auth/me');
}

