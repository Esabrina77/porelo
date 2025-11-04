/**
 * POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION
 * 
 * Ce fichier est le composant racine de l'application React Native.
 * Il configure:
 * - Le contexte d'authentification (AuthProvider)
 * - La navigation conditionnelle (login si non connecté, produits si connecté)
 * 
 * Structure:
 * 1. AuthProvider enveloppe toute l'app pour partager l'état d'auth
 * 2. Si l'utilisateur n'est pas connecté → afficher les écrans d'auth
 * 3. Si l'utilisateur est connecté → afficher les écrans principaux
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import MainTabsNavigator from './src/navigation/MainTabsNavigator';
import Toast from 'react-native-toast-message';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Navigateur pour les écrans d'auth (non connecté)
const AuthStack = createStackNavigator();

/**
 * Composant pour la navigation d'authentification
 * Affiché quand l'utilisateur n'est pas connecté
 */
function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Landing"
    >
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * Composant principal qui gère la navigation conditionnelle
 * 
 * Logique:
 * - Si isLoading: afficher un loader (vérification du token en cours)
 * - Si !isAuthenticated: afficher les écrans d'auth (Login/Register)
 * - Si isAuthenticated: afficher l'app principale (Produits, etc.)
 */
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Afficher un loader pendant la vérification du token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5784BA" />
      </View>
    );
  }

  // Log pour debug
  console.log('[App] État auth - isAuthenticated:', isAuthenticated, 'user:', user?.email || 'null');

  // Navigation conditionnelle basée sur l'état d'authentification
  // Un seul NavigationContainer pour toute l'app
  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Utilisateur non connecté → écrans d'authentification
        <AuthNavigator />
      ) : (
        // Utilisateur connecté → application principale avec Bottom Tabs
        <CartProvider>
          <FavoritesProvider>
            <MainTabsNavigator />
            <Toast />
          </FavoritesProvider>
        </CartProvider>
      )}
    </NavigationContainer>
  );
}

/**
 * Composant racine de l'application
 * 
 * Le SafeAreaProvider doit être au plus haut niveau pour gérer les zones de sécurité.
 * Le AuthProvider doit envelopper toute l'app pour que le contexte soit disponible partout.
 * Les polices Google Fonts sont chargées ici pour être disponibles dans toute l'app.
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  // Afficher un loader pendant le chargement des polices
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5784BA" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
