/**
 * NAVIGATION BOTTOM TABS
 * 
 * Ce fichier configure la navigation par onglets en bas de l'écran.
 * Il contient 4 onglets principaux :
 * - Produits : Liste des produits
 * - Panier : Panier d'achat
 * - Commandes : Historique des commandes
 * - Profil : Informations utilisateur et déconnexion
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Home01Icon, 
  ShoppingCart01Icon, 
  InvoiceIcon, 
  User02Icon,
  Package01Icon,
  FolderIcon,
  FilesIcon,
} from '@hugeicons/core-free-icons';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Import des écrans utilisateur
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import des écrans admin
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import CreateProductScreen from '../screens/admin/CreateProductScreen';
import EditProductScreen from '../screens/admin/EditProductScreen';

// Import des écrans de détails
import ProductDetailScreen from '../screens/ProductDetailScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Créer le Tab Navigator
const Tab = createBottomTabNavigator();

// Créer un Stack Navigator pour les Produits (pour permettre ProductDetail)
const ProductsStack = createStackNavigator<RootStackParamList>();

/**
 * Stack Navigator pour les Produits
 * Permet de naviguer vers ProductDetail depuis Products
 */
function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <ProductsStack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Produits' }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Détails du produit' }}
      />
    </ProductsStack.Navigator>
  );
}

// Créer un Stack Navigator pour les Produits Admin (pour permettre Create/Edit)
const AdminProductsStack = createStackNavigator<RootStackParamList>();

/**
 * Stack Navigator pour les Produits Admin
 * Permet de naviguer vers CreateProduct et EditProduct depuis AdminProducts
 */
function AdminProductsStackNavigator() {
  return (
    <AdminProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <AdminProductsStack.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ title: 'Gestion Produits' }}
      />
      <AdminProductsStack.Screen
        name="CreateProduct"
        component={CreateProductScreen}
        options={{ title: 'Nouveau produit' }}
      />
      <AdminProductsStack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: 'Modifier le produit' }}
      />
    </AdminProductsStack.Navigator>
  );
}

// Créer un Stack Navigator pour les Commandes (pour permettre OrderDetail)
const OrdersStack = createStackNavigator<RootStackParamList>();

/**
 * Stack Navigator pour les Commandes
 * Permet de naviguer vers OrderDetail depuis Orders
 */
function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <OrdersStack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Mes Commandes' }}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Détails de la commande' }}
      />
    </OrdersStack.Navigator>
  );
}

// Créer un Stack Navigator pour les Commandes Admin (pour permettre OrderDetail)
const AdminOrdersStack = createStackNavigator<RootStackParamList>();

/**
 * Stack Navigator pour les Commandes Admin
 * Permet de naviguer vers OrderDetail depuis AdminOrders
 */
function AdminOrdersStackNavigator() {
  return (
    <AdminOrdersStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <AdminOrdersStack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: 'Gestion Commandes' }}
      />
      <AdminOrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Détails de la commande' }}
      />
    </AdminOrdersStack.Navigator>
  );
}

/**
 * Navigateur principal avec Bottom Tabs
 * 
 * Affiche des onglets différents selon le rôle :
 * - USER : Produits, Panier, Commandes, Profil
 * - ADMIN : Produits Admin, Catégories, Commandes Admin, Profil
 */
export default function MainTabsNavigator() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // Récupérer les zones de sécurité (safe area)
  
  // Déterminer si l'utilisateur est admin
  // Vérifier avec différentes variations de casse pour être sûr
  const isAdmin = user?.role === 'ADMIN' || user?.role?.toUpperCase() === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={{
        // Style de l'en-tête
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        // Style des onglets avec gestion des zones de sécurité
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.light,
        tabBarStyle: {
          backgroundColor: colors.surface.white,
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 10), // Au moins 10px ou la zone de sécurité
          paddingTop: 10,
          height: 60 + Math.max(insets.bottom - 10, 0), // Ajuster la hauteur selon la safe area
          elevation: 8, // Ombre plus prononcée pour mieux se distinguer
          shadowColor: colors.shadow.color,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 2, // Petite marge pour le label
        },
        tabBarIconStyle: {
          marginTop: 4, // Petite marge pour l'icône
        },
      }}
    >
      {isAdmin ? (
        // ============================================
        // ONGLETS ADMIN
        // ============================================
        <>
          {/* Onglet Produits Admin */}
          <Tab.Screen
            name="AdminProducts"
            component={AdminProductsStackNavigator}
            options={{
              title: 'Gestion Produits',
              headerShown: false, // Le header est géré par AdminProductsStackNavigator
              tabBarLabel: 'Produits',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={Package01Icon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Catégories */}
          <Tab.Screen
            name="AdminCategories"
            component={AdminCategoriesScreen}
            options={{
              title: 'Gestion Catégories',
              tabBarLabel: 'Catégories',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={FolderIcon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Commandes Admin */}
          <Tab.Screen
            name="AdminOrders"
            component={AdminOrdersStackNavigator}
            options={{
              title: 'Gestion Commandes',
              headerShown: false, // Le header est géré par AdminOrdersStackNavigator
              tabBarLabel: 'Commandes',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={FilesIcon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Profil */}
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profil',
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={User02Icon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
        </>
      ) : (
        // ============================================
        // ONGLETS UTILISATEUR
        // ============================================
        <>
          {/* Onglet Produits */}
          <Tab.Screen
            name="ProductsTab"
            component={ProductsStackNavigator}
            options={{
              title: 'Produits',
              headerShown: false, // Le header est géré par ProductsStackNavigator
              tabBarLabel: 'Produits',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={Home01Icon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Panier */}
          <Tab.Screen
            name="Cart"
            component={CartScreen}
            options={{
              title: 'Panier',
              tabBarLabel: 'Panier',
              tabBarBadge: totalItems > 0 ? totalItems : undefined, // Badge avec le nombre d'articles
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={ShoppingCart01Icon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Commandes */}
          <Tab.Screen
            name="Orders"
            component={OrdersStackNavigator}
            options={{
              title: 'Mes Commandes',
              headerShown: false, // Le header est géré par OrdersStackNavigator
              tabBarLabel: 'Commandes',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={InvoiceIcon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />

          {/* Onglet Favoris */}
          <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              title: 'Mes Favoris',
              tabBarLabel: 'Favoris',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons 
                  name={focused ? "heart" : "heart-outline"} 
                  size={focused ? size + 2 : size} 
                  color={color}
                />
              ),
            }}
          />

          {/* Onglet Profil */}
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Profil',
              tabBarLabel: 'Profil',
              tabBarIcon: ({ color, size, focused }) => (
                <HugeiconsIcon 
                  icon={User02Icon} 
                  size={focused ? size + 2 : size} 
                  color={color} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}


