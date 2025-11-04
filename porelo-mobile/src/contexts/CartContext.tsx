/**
 * CONTEXTE DU PANIER (CART CONTEXT)
 * 
 * Ce contexte gère l'état du panier d'achat de l'utilisateur.
 * Il permet d'ajouter, retirer des produits et calculer le total.
 * 
 * Le panier est stocké localement dans AsyncStorage pour persister
 * même après fermeture de l'application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

// Type pour un article du panier (produit + quantité)
export interface CartItem {
  product: Product;
  quantity: number;
}

// Type pour le contexte du panier
interface CartContextType {
  // État du panier
  items: CartItem[];
  // Total d'articles dans le panier
  totalItems: number;
  // Prix total du panier
  totalPrice: number;
  
  // Fonctions pour gérer le panier
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  // Vérifier si un produit est dans le panier
  isInCart: (productId: string) => boolean;
  // Obtenir la quantité d'un produit dans le panier
  getQuantity: (productId: string) => number;
}

// Créer le contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Clé pour stocker le panier dans AsyncStorage
const CART_STORAGE_KEY = '@porelo:cart';

// Props du provider
interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte Panier
 * 
 * Gère l'état du panier et le synchronise avec AsyncStorage
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Charger le panier depuis AsyncStorage au démarrage
   */
  useEffect(() => {
    loadCart();
  }, []);

  /**
   * Sauvegarder le panier dans AsyncStorage à chaque modification
   */
  useEffect(() => {
    saveCart();
  }, [items]);

  /**
   * Charger le panier depuis AsyncStorage
   */
  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  };

  /**
   * Sauvegarder le panier dans AsyncStorage
   */
  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  };

  /**
   * Ajouter un produit au panier
   * 
   * @param product - Produit à ajouter
   * @param quantity - Quantité à ajouter (défaut: 1)
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      // Vérifier si le produit est déjà dans le panier
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Si le produit existe, augmenter la quantité
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si le produit n'existe pas, l'ajouter
        return [...currentItems, { product, quantity }];
      }
    });
  };

  /**
   * Retirer un produit du panier
   * 
   * @param productId - ID du produit à retirer
   */
  const removeFromCart = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter(item => item.product.id !== productId)
    );
  };

  /**
   * Mettre à jour la quantité d'un produit dans le panier
   * 
   * @param productId - ID du produit
   * @param quantity - Nouvelle quantité (si 0, le produit est retiré)
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  /**
   * Vider complètement le panier
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Vérifier si un produit est dans le panier
   * 
   * @param productId - ID du produit
   * @returns true si le produit est dans le panier
   */
  const isInCart = (productId: string): boolean => {
    return items.some(item => item.product.id === productId);
  };

  /**
   * Obtenir la quantité d'un produit dans le panier
   * 
   * @param productId - ID du produit
   * @returns Quantité du produit (0 si pas dans le panier)
   */
  const getQuantity = (productId: string): number => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  /**
   * Calculer le total d'articles dans le panier
   */
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  /**
   * Calculer le prix total du panier
   */
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Valeur du contexte
  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook pour utiliser le contexte Panier
 * 
 * @returns Contexte du panier
 * @throws Erreur si utilisé en dehors du CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

