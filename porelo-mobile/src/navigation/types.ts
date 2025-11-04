/**
 * TYPES DE NAVIGATION
 * 
 * Ce fichier définit les types TypeScript pour la navigation de l'application.
 * Cela permet d'avoir une navigation type-safe avec autocomplétion.
 */

import { StackScreenProps } from '@react-navigation/stack';

/**
 * Liste de tous les écrans de l'application et leurs paramètres
 * 
 * Exemple:
 * - Login: pas de paramètres
 * - ProductDetail: nécessite un productId
 */
export type RootStackParamList = {
  // Écrans d'authentification
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  
  // Navigation principale (Bottom Tabs)
  MainTabs: undefined;
  
  // Écrans principaux (dans les tabs)
  Products: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Favorites: undefined;
  Profile: undefined;
  
  // Écrans admin (dans les tabs admin)
  AdminProducts: undefined;
  AdminCategories: undefined;
  AdminOrders: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: string };
};

/**
 * Type helper pour les props de navigation dans un écran
 * 
 * Utilisation:
 * type Props = StackScreenProps<RootStackParamList, 'ProductDetail'>;
 * const { navigation, route } = props;
 * const productId = route.params.productId;
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

