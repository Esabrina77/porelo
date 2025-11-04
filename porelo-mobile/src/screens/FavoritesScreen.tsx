/**
 * ÉCRAN FAVORIS
 * 
 * Cet écran affiche tous les produits favoris de l'utilisateur.
 * L'utilisateur peut :
 * - Voir tous ses produits favoris
 * - Retirer un produit des favoris
 * - Naviguer vers les détails d'un produit
 * - Vider tous les favoris
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Product } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Toast from 'react-native-toast-message';

// Type pour la navigation dans les Bottom Tabs
type MainTabsParamList = {
  ProductsTab: undefined;
  Cart: undefined;
  Orders: undefined;
  Favorites: undefined;
  Profile: undefined;
};

type FavoritesScreenNavigationProp = BottomTabNavigationProp<MainTabsParamList, 'Favorites'> & StackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { favorites, removeFromFavorites, toggleFavorite, clearFavorites, favoritesCount } = useFavorites();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  /**
   * Gérer le pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simuler un rafraîchissement (les favoris sont déjà à jour depuis AsyncStorage)
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  /**
   * Formater le prix
   */
  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} €`;
  };

  /**
   * Retirer un produit des favoris
   */
  const handleRemoveFavorite = (product: Product) => {
    removeFromFavorites(product.id);
    Toast.show({
      type: 'success',
      text1: 'Retiré des favoris',
      text2: `${product.name} a été retiré de vos favoris`,
      position: 'bottom',
    });
  };

  /**
   * Vider tous les favoris
   */
  const handleClearFavorites = () => {
    Alert.alert(
      'Vider les favoris',
      'Êtes-vous sûr de vouloir retirer tous vos produits favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => {
            clearFavorites();
            Toast.show({
              type: 'info',
              text1: 'Favoris vidés',
              text2: 'Tous vos favoris ont été supprimés',
              position: 'bottom',
            });
          },
        },
      ]
    );
  };

  /**
   * Naviguer vers les détails d'un produit
   * Utilise la navigation parente pour accéder au stack navigator ProductsTab
   */
  const navigateToProductDetail = (productId: string) => {
    // Naviguer vers ProductsTab puis vers ProductDetail dans le stack
    navigation.navigate('ProductsTab', {
      screen: 'ProductDetail',
      params: { productId },
    } as any);
  };

  /**
   * Rendre un item de la liste
   */
  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Animatable.View
      key={item.id}
      animation="fadeInUp"
      delay={index * 100}
      duration={500}
    >
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigateToProductDetail(item.id)}
        activeOpacity={0.7}
      >
        {/* Image du produit */}
        {item.imageURL ? (
          <Image source={{ uri: item.imageURL }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={colors.text.light} />
          </View>
        )}

        {/* Informations du produit */}
        <View style={styles.productInfo}>
          <View style={styles.productInfoHeader}>
            <View style={styles.productInfoText}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              {item.category && (
                <Text style={styles.productCategory}>{item.category.name}</Text>
              )}
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            </View>
            
            {/* Badge favoris */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(item);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={24} color={colors.status.error} />
            </TouchableOpacity>
          </View>
          
          {/* Indicateur de stock */}
          <View style={styles.stockContainer}>
            {item.stock > 0 ? (
              <View style={styles.stockIndicator}>
                <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
                <Text style={styles.stockText}>Disponible</Text>
              </View>
            ) : (
              <View style={styles.outOfStockBadge}>
                <Ionicons name="close-circle" size={16} color={colors.status.error} />
                <Text style={styles.outOfStockText}>Rupture de stock</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  // Liste vide - Style amélioré
  if (favoritesCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animatable.View animation="fadeInDown" duration={600} style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={100} color={colors.accent} />
          </View>
          <Text style={styles.emptyText}>Vos favoris sont vides</Text>
          <Text style={styles.emptySubtext}>
            Découvrez nos produits et ajoutez ceux que vous aimez à vos favoris en cliquant sur l'icône cœur
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('ProductsTab')}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={20} color={colors.text.white} style={styles.browseButtonIcon} />
            <Text style={styles.browseButtonText}>Parcourir les produits</Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec compteur - Style moderne */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="heart" size={28} color={colors.status.error} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Mes Favoris</Text>
              <Text style={styles.headerSubtitle}>
                {favoritesCount} produit{favoritesCount > 1 ? 's' : ''} sauvegardé{favoritesCount > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {favoritesCount > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFavorites}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </Animatable.View>

      {/* Liste des favoris */}
      <FlatList
        data={favorites}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 4,
    fontSize: 24,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontSize: 13,
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.status.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.white,
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
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productInfoText: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 4,
    fontSize: 16,
  },
  productCategory: {
    ...typography.badge,
    color: colors.text.secondary,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  productPrice: {
    ...typography.price,
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.status.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockContainer: {
    marginTop: 8,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockText: {
    ...typography.badge,
    color: colors.status.success,
    fontSize: 12,
    fontWeight: '600',
  },
  outOfStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outOfStockText: {
    ...typography.badge,
    color: colors.status.error,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 24,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  browseButtonIcon: {
    marginRight: 4,
  },
  browseButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

