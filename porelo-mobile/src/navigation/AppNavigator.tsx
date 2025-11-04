/**
 * NAVIGATION PRINCIPALE
 * 
 * Ce fichier configure la navigation de l'application avec React Navigation.
 * Il définit tous les écrans et la façon de naviguer entre eux.
 * 
 * NOTE: Pas de NavigationContainer ici car il est géré dans App.tsx
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Import des écrans
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

// Créer le navigator (pile d'écrans)
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Navigateur principal de l'application (pour utilisateurs connectés)
 * 
 * Définit tous les écrans disponibles et leurs options (titre, header, etc.)
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Products"
      screenOptions={{
        // Options par défaut pour tous les écrans
        headerStyle: {
          backgroundColor: '#5784BA', // Couleur primaire de la charte
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      {/* Écrans principaux */}
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'Produits',
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Détails du produit',
        }}
      />
    </Stack.Navigator>
  );
}

