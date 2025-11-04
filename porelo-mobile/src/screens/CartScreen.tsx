/**
 * ÉCRAN PANIER
 * 
 * Cet écran affiche tous les produits dans le panier de l'utilisateur.
 * L'utilisateur peut :
 * - Voir tous les articles avec quantité et prix
 * - Modifier les quantités
 * - Retirer des articles
 * - Voir le total
 * - Passer la commande
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { orderService } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Type pour la navigation dans les Bottom Tabs
type MainTabsParamList = {
  ProductsTab: undefined;
  Cart: undefined;
  Orders: undefined;
  Favorites: undefined;
  Profile: undefined;
};

type CartScreenNavigationProp = BottomTabNavigationProp<MainTabsParamList, 'Cart'>;

export default function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Formater le prix pour l'affichage
   */
  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} €`;
  };

  /**
   * Augmenter la quantité d'un produit
   */
  const handleIncreaseQuantity = (productId: string, currentQuantity: number) => {
    // Vérifier le stock avant d'augmenter
    const item = items.find(i => i.product.id === productId);
    if (item && currentQuantity >= item.product.stock) {
      Alert.alert('Stock insuffisant', 'Vous ne pouvez pas ajouter plus de produits.');
      return;
    }
    updateQuantity(productId, currentQuantity + 1);
  };

  /**
   * Diminuer la quantité d'un produit
   */
  const handleDecreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  /**
   * Retirer un produit du panier avec confirmation
   */
  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(
      'Retirer du panier',
      `Êtes-vous sûr de vouloir retirer "${productName}" du panier ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  /**
   * Passer la commande
   * 
   * Convertit le panier en commande et l'envoie à l'API
   */
  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Panier vide', 'Votre panier est vide.');
      return;
    }

    // Vérifier que tous les produits ont du stock
    for (const item of items) {
      if (item.quantity > item.product.stock) {
        Alert.alert(
          'Stock insuffisant',
          `Le produit "${item.product.name}" n'a plus assez de stock.`
        );
        return;
      }
    }

    Alert.alert(
      'Passer la commande',
      `Total: ${formatPrice(totalPrice)}\n\nConfirmer la commande ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setIsLoading(true);

              // Préparer les données de la commande
              const orderData = {
                items: items.map(item => ({
                  productID: item.product.id,
                  quantity: item.quantity,
                })),
              };

              // Envoyer la commande à l'API
              await orderService.create(orderData);

              // Vider le panier après succès
              clearCart();

              Alert.alert(
                'Commande réussie !',
                'Votre commande a été passée avec succès.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Naviguer vers l'écran des commandes
                      navigation.navigate('Orders');
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Erreur lors de la commande:', error);
              
              let errorMessage = 'Erreur lors de la commande';
              if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              } else if (error.message) {
                errorMessage = error.message;
              }

              Alert.alert('Erreur', errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Panier vide
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('ProductsTab')}
        >
          <Text style={styles.browseButtonText}>Parcourir les produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Liste des articles */}
        {items.map((item, index) => (
          <Animatable.View
            key={item.product.id}
            animation="fadeInLeft"
            delay={index * 100}
            duration={500}
          >
            <View style={styles.cartItem}>
            {/* Image du produit */}
            {item.product.imageURL ? (
              <Image source={{ uri: item.product.imageURL }} style={styles.productImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Pas d'image</Text>
              </View>
            )}

            {/* Informations du produit */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.product.price)}</Text>
              
              {/* Contrôles de quantité */}
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleDecreaseQuantity(item.product.id, item.quantity)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncreaseQuantity(item.product.id, item.quantity)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Text
                    style={[
                      styles.quantityButtonText,
                      item.quantity >= item.product.stock && styles.quantityButtonTextDisabled,
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Prix total pour cet article */}
              <Text style={styles.itemTotal}>
                Total: {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>

            {/* Bouton retirer */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.product.id, item.product.name)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          </Animatable.View>
        ))}
      </ScrollView>

      {/* Résumé de la commande */}
      <Animatable.View animation="fadeInUp" delay={300} duration={600} style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total articles:</Text>
          <Text style={styles.summaryValue}>{totalItems}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelTotal}>Total:</Text>
          <Text style={styles.summaryValueTotal}>{formatPrice(totalPrice)}</Text>
        </View>

        {/* Bouton passer la commande */}
        <TouchableOpacity
          style={[styles.checkoutButton, isLoading && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Passer la commande</Text>
          )}
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  placeholderText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.text.light,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 5,
  },
  productPrice: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    ...typography.sectionTitle,
    color: colors.text.white,
  },
  quantityButtonTextDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    ...typography.label,
    color: colors.primary,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    ...typography.title,
    fontSize: 24,
    color: colors.status.error,
  },
  summary: {
    backgroundColor: colors.surface.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  summaryLabelTotal: {
    ...typography.sectionTitle,
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: typography.sectionTitle.fontFamily,
  },
  summaryValueTotal: {
    ...typography.price,
    color: colors.primary,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  emptyText: {
    ...typography.sectionTitle,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
});

