/**
 * CONTEXTE FAVORIS
 * 
 * Ce contexte gère la liste des produits favoris de l'utilisateur.
 * Les favoris sont stockés localement avec AsyncStorage.
 * 
 * Fonctionnalités :
 * - Ajouter/retirer des favoris
 * - Vérifier si un produit est en favoris
 * - Récupérer la liste complète des favoris
 * - Persistance automatique dans AsyncStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

// ============================================
// TYPES
// ============================================

interface FavoritesContextType {
  favorites: Product[];
  isFavorite: (productId: string) => boolean;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

// ============================================
// CONSTANTES
// ============================================

const FAVORITES_STORAGE_KEY = '@porelo:favorites';

// ============================================
// CONTEXTE
// ============================================

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Props du provider
interface FavoritesProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte Favoris
 * 
 * Gère l'état des favoris et le synchronise avec AsyncStorage
 */
export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);

  /**
   * Charger les favoris depuis AsyncStorage au démarrage
   */
  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Sauvegarder les favoris dans AsyncStorage à chaque modification
   */
  useEffect(() => {
    saveFavorites();
  }, [favorites]);

  /**
   * Charger les favoris depuis AsyncStorage
   */
  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favoritesData) {
        const parsedFavorites = JSON.parse(favoritesData);
        setFavorites(parsedFavorites);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  /**
   * Sauvegarder les favoris dans AsyncStorage
   */
  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  };

  /**
   * Vérifier si un produit est en favoris
   * 
   * @param productId - ID du produit à vérifier
   * @returns true si le produit est en favoris
   */
  const isFavorite = (productId: string): boolean => {
    return favorites.some(product => product.id === productId);
  };

  /**
   * Ajouter un produit aux favoris
   * 
   * @param product - Produit à ajouter
   */
  const addToFavorites = (product: Product) => {
    setFavorites((currentFavorites) => {
      // Vérifier si le produit n'est pas déjà en favoris
      if (!currentFavorites.some(item => item.id === product.id)) {
        return [...currentFavorites, product];
      }
      return currentFavorites;
    });
  };

  /**
   * Retirer un produit des favoris
   * 
   * @param productId - ID du produit à retirer
   */
  const removeFromFavorites = (productId: string) => {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(product => product.id !== productId)
    );
  };

  /**
   * Basculer l'état favoris d'un produit
   * Si le produit est en favoris, il sera retiré, sinon il sera ajouté
   * 
   * @param product - Produit à basculer
   */
  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  /**
   * Vider tous les favoris
   */
  const clearFavorites = () => {
    setFavorites([]);
  };

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte Favoris
 * 
 * @returns Le contexte Favoris
 * @throws Error si utilisé en dehors du FavoritesProvider
 */
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

