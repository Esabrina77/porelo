/**
 * CONTEXTE D'AUTHENTIFICATION
 * 
 * Ce contexte React permet de partager l'état d'authentification
 * dans toute l'application sans avoir à passer les props partout.
 * 
 * Utilisation:
 * const { user, login, logout, isLoading } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/api';

// ============================================
// TYPES DU CONTEXTE
// ============================================

interface AuthContextType {
  // État de l'utilisateur
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Méthodes d'authentification
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  
  // Recharger les données utilisateur
  refreshUser: () => Promise<void>;
}

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER (composant qui fournit le contexte)
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // État local
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true au démarrage pour vérifier le token

  /**
   * Vérifier si l'utilisateur est déjà connecté au démarrage de l'app
   * 
   * Cette fonction vérifie si un token existe dans le stockage.
   * Si oui, on récupère les données de l'utilisateur.
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si un token existe
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        try {
          // Si token existe, récupérer les données utilisateur
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log('[AuthContext] Utilisateur connecté:', userData.email);
        } catch (userError: any) {
          // Si erreur 401 lors de la récupération de l'utilisateur, le token est invalide
          if (userError.response?.status === 401) {
            console.error('[AuthContext] Token invalide lors de la vérification');
            setUser(null);
            await authService.logout(); // Nettoyer le token invalide
          } else {
            throw userError;
          }
        }
      } else {
        // Pas de token, utilisateur non connecté
        console.log('[AuthContext] Aucun token trouvé');
        setUser(null);
      }
    } catch (error) {
      // Erreur (token invalide, réseau, etc.)
      console.error('[AuthContext] Erreur lors de la vérification de l\'authentification:', error);
      setUser(null);
      await authService.logout(); // Nettoyer le token invalide
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion d'un utilisateur
   */
  const login = async (data: LoginRequest): Promise<void> => {
    try {
      // Appeler l'API de login
      const response = await authService.login(data);
      
      // Mettre à jour l'état avec les données utilisateur
      setUser(response.user);
    } catch (error: any) {
      // Propager l'erreur pour que l'écran de login puisse l'afficher
      throw error;
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      // Appeler l'API d'inscription
      const response = await authService.register(data);
      
      // Mettre à jour l'état avec les données utilisateur
      setUser(response.user);
    } catch (error: any) {
      // Propager l'erreur
      throw error;
    }
  };

  /**
   * Déconnexion
   */
  const logout = async (): Promise<void> => {
    try {
      // Supprimer le token
      await authService.logout();
      
      // Réinitialiser l'état
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on réinitialise l'état local
      setUser(null);
    }
  };

  /**
   * Recharger les données utilisateur (utile après modification du profil)
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
      // Si erreur (token invalide), déconnecter
      await logout();
    }
  };

  // Valeur du contexte
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// HOOK PERSONNALISÉ (pour utiliser le contexte facilement)
// ============================================

/**
 * Hook pour accéder au contexte d'authentification
 * 
 * Utilisation dans un composant:
 * const { user, login, logout } = useAuth();
 * 
 * @throws Error si utilisé en dehors d'un AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
};

