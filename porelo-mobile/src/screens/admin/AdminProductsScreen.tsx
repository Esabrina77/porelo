/**
 * ÉCRAN ADMIN - GESTION DES PRODUITS
 * 
 * Cet écran permet aux administrateurs de gérer les produits :
 * - Voir tous les produits
 * - Créer un nouveau produit
 * - Modifier un produit existant
 * - Supprimer un produit
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types';
import { productService } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type AdminProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminProducts'>;

export default function AdminProductsScreen() {
  const navigation = useNavigation<AdminProductsScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Charger les produits depuis l'API
   */
  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      let errorMessage = 'Impossible de charger les produits';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /**
   * Recharger les produits quand l'écran est focus
   * Cela permet de rafraîchir après création/modification
   */
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProducts();
  };

  /**
   * Supprimer un produit avec confirmation
   */
  const handleDelete = (product: Product) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.delete(product.id);
              Alert.alert('Succès', 'Produit supprimé avec succès');
              loadProducts();
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            }
          },
        },
      ]
    );
  };

  /**
   * Formater le prix
   */
  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} €`;
  };

  /**
   * Rendre un item de la liste
   */
  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={600}
      style={{ marginBottom: 16 }}
    >
      <View style={styles.productCard}>
        {/* Image */}
        {item.imageURL ? (
          <Image source={{ uri: item.imageURL }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={30} color={colors.text.light} />
          </View>
        )}

        {/* Informations */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productStock}>Stock: {item.stock}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              navigation.navigate('EditProduct', { productId: item.id });
            }}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate('CreateProduct');
        }}
      >
        <Ionicons name="add" size={24} color={colors.text.white} />
        <Text style={styles.addButtonText}>Ajouter un produit</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        renderItem={({ item, index }) => renderProductItem({ item, index })}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun produit</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    margin: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 4,
  },
  productPrice: {
    ...typography.price,
    color: colors.primary,
    marginBottom: 4,
  },
  productStock: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.status.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    ...typography.body,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.sectionTitle,
    color: colors.text.secondary,
  },
});

