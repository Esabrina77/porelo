/**
 * ÉCRAN DE LISTE DES PRODUITS
 * 
 * Cet écran affiche tous les produits disponibles dans la boutique.
 * Fonctionnalités :
 * - Recherche par nom
 * - Filtres : catégorie, prix, disponibilité
 * - Tri : par prix, par nom
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { Product, Category } from '../types';
import { productService } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import Toast from 'react-native-toast-message';

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

// Types pour les filtres
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type StockFilter = 'all' | 'in-stock' | 'out-of-stock';

export default function ProductsScreen() {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const { isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // État local
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 20; // Nombre de produits par page

  // État des filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  /**
   * Charger les produits depuis l'API avec pagination
   * Les catégories sont extraites depuis les produits
   */
  const loadData = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      // Vérifier le token avant la requête
      const token = await AsyncStorage.getItem('@porelo:token');
      if (!token) {
        console.error('[ProductsScreen] Aucun token trouvé - déconnexion requise');
        Alert.alert('Erreur', 'Vous devez vous reconnecter');
        return;
      }
      
      const response = await productService.getPaginated(page, PAGE_SIZE);
      
      // La réponse est toujours au format PaginatedProductsResponse maintenant
      // Gérer à la fois les formats "products" et "Products" (casse)
      const products = response.products || (response as any).Products || [];
      const hasNext = response.hasNext !== undefined ? response.hasNext : (response as any).HasNext || false;
      
      if (append) {
        // Ajouter les nouveaux produits à la liste existante
        setAllProducts((prev) => [...prev, ...products]);
      } else {
        // Remplacer la liste complète
        setAllProducts(products);
      }
      
      setCurrentPage(page);
      setHasMore(hasNext);
    } catch (error: any) {
      console.error('[ProductsScreen] Erreur lors du chargement:', error);
      console.error('[ProductsScreen] Status:', error.response?.status);
      console.error('[ProductsScreen] Data:', error.response?.data);
      
      let errorMessage = 'Impossible de charger les produits';
      if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  /**
   * Charger plus de produits (infinite scroll)
   */
  const loadMoreProducts = () => {
    if (!isLoadingMore && hasMore) {
      loadData(currentPage + 1, true);
    }
  };

  /**
   * Extraire les catégories uniques depuis les produits
   */
  const categories = useMemo(() => {
    const categoriesMap = new Map<string, Category>();
    
    allProducts.forEach((product) => {
      if (product.category && product.categoryID) {
        // Éviter les doublons en utilisant l'ID comme clé
        if (!categoriesMap.has(product.categoryID)) {
          categoriesMap.set(product.categoryID, product.category);
        }
      }
    });
    
    // Convertir la Map en tableau et trier par nom
    return Array.from(categoriesMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [allProducts]);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Filtrer et trier les produits
   */
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Recherche par nom
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoryID === selectedCategory
      );
    }

    // Filtre par prix
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter((product) => product.price >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter((product) => product.price <= max);
      }
    }

    // Filtre par stock
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter((product) => product.stock > 0);
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter((product) => product.stock === 0);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, minPrice, maxPrice, stockFilter, sortOption]);

  /**
   * Réinitialiser tous les filtres
   */
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setStockFilter('all');
    setSortOption('name-asc');
  };

  /**
   * Vérifier si des filtres sont actifs
   */
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== null ||
      minPrice !== '' ||
      maxPrice !== '' ||
      stockFilter !== 'all' ||
      sortOption !== 'name-asc'
    );
  }, [searchQuery, selectedCategory, minPrice, maxPrice, stockFilter, sortOption]);

  /**
   * Gérer le pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    loadData(1, false);
  };

  /**
   * Naviguer vers l'écran de détails d'un produit
   */
  const navigateToProductDetail = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  /**
   * Formater le prix pour l'affichage
   */
  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} €`;
  };

  /**
   * Rendre un item de la liste
   */
  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={styles.productCardWrapper}>
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        duration={600}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => navigateToProductDetail(item.id)}
          activeOpacity={0.8}
        >
        {/* Image du produit */}
        <View style={styles.imageContainer}>
          {item.imageURL ? (
            <Image source={{ uri: item.imageURL }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={40} color={colors.text.light} />
            </View>
          )}

          {/* Icône favoris */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item);
              Toast.show({
                type: isFavorite(item.id) ? 'info' : 'success',
                text1: isFavorite(item.id) ? 'Retiré des favoris' : 'Ajouté aux favoris',
                text2: `${item.name}`,
                position: 'bottom',
              });
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite(item.id) ? colors.status.error : colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Overlay avec infos produit */}
          <View style={styles.productOverlay}>
            <View style={styles.productOverlayContent}>
              <Text style={styles.productNameOverlay} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.productOverlayFooter}>
                <Text style={styles.productVolume}>{item.category?.name || 'Produit'}</Text>
                <Text style={styles.productPriceOverlay}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          </View>

          {/* Badge stock */}
          {item.stock > 0 && (
            <View style={styles.stockBadgeOverlay}>
              <Text style={styles.stockBadgeText}>En stock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      </Animatable.View>
    </View>
  );

  // Écran de chargement initial
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
      {/* Barre de recherche et filtres */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasActiveFilters ? colors.text.white : colors.text.primary}
            />
            <Text
              style={[
                styles.filterButtonText,
                hasActiveFilters && styles.filterButtonTextActive,
              ]}
            >
              Filtres
            </Text>
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {[searchQuery && '1', selectedCategory && '1', minPrice && '1', maxPrice && '1', stockFilter !== 'all' && '1', sortOption !== 'name-asc' && '1'].filter(Boolean).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Résultats */}
      {!isLoading && filteredAndSortedProducts.length === 0 && allProducts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={64} color={colors.text.light} />
          <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          <Text style={styles.emptySubtext}>
            Essayez de modifier vos critères de recherche
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity style={styles.resetButtonLarge} onPress={resetFilters}>
              <Text style={styles.resetButtonTextLarge}>Réinitialiser les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedProducts}
          renderItem={({ item, index }) => renderProductItem({ item, index })}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            filteredAndSortedProducts.length !== allProducts.length ? (
              <Text style={styles.resultsCount}>
                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''} trouvé{filteredAndSortedProducts.length > 1 ? 's' : ''}
              </Text>
            ) : null
          }
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadMoreText}>Chargement...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Modal de filtres */}
      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres et tri</Text>
              <TouchableOpacity onPress={() => setFiltersVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Catégorie */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Catégorie</Text>
                <View style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      selectedCategory === null && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setSelectedCategory(null)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory === null && styles.categoryOptionTextSelected,
                      ]}
                    >
                      Toutes
                    </Text>
                  </TouchableOpacity>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        selectedCategory === category.id && styles.categoryOptionSelected,
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          selectedCategory === category.id && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Prix */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Prix (€)</Text>
                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Min</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="0"
                      placeholderTextColor={colors.text.light}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Max</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="999"
                      placeholderTextColor={colors.text.light}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Stock */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Disponibilité</Text>
                <View style={styles.stockOptionsRow}>
                  {(['all', 'in-stock', 'out-of-stock'] as StockFilter[]).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.stockOption,
                        stockFilter === option && styles.stockOptionSelected,
                      ]}
                      onPress={() => setStockFilter(option)}
                    >
                      <Text
                        style={[
                          styles.stockOptionText,
                          stockFilter === option && styles.stockOptionTextSelected,
                        ]}
                      >
                        {option === 'all' ? 'Tous' : option === 'in-stock' ? 'En stock' : 'Rupture'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tri */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Trier par</Text>
                <View style={styles.sortOptionsContainer}>
                  {([
                    { value: 'name-asc', label: 'Nom (A-Z)' },
                    { value: 'name-desc', label: 'Nom (Z-A)' },
                    { value: 'price-asc', label: 'Prix croissant' },
                    { value: 'price-desc', label: 'Prix décroissant' },
                  ] as { value: SortOption; label: string }[]).map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        sortOption === option.value && styles.sortOptionSelected,
                      ]}
                      onPress={() => setSortOption(option.value)}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortOption === option.value && styles.sortOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {sortOption === option.value && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Boutons du modal */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalResetButton}
                onPress={resetFilters}
              >
                <Text style={styles.modalResetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => setFiltersVisible(false)}
              >
                <Text style={styles.modalApplyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    backgroundColor: colors.surface.white,
    padding: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    padding: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.label,
    color: colors.text.primary,
  },
  filterButtonTextActive: {
    color: colors.text.white,
  },
  filterBadge: {
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    ...typography.badge,
    color: colors.text.white,
    fontSize: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetButtonText: {
    ...typography.label,
    color: colors.text.secondary,
    fontSize: 14,
  },
  resetButtonLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  resetButtonTextLarge: {
    ...typography.button,
    color: colors.text.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  productCardWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  productCard: {
    width: '100%',
    backgroundColor: colors.surface.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 280,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: colors.primaryLight,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  productOverlayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productNameOverlay: {
    flex: 1,
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginRight: 12,
  },
  productOverlayFooter: {
    alignItems: 'flex-end',
  },
  productVolume: {
    ...typography.badge,
    color: colors.text.secondary,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  productPriceOverlay: {
    ...typography.price,
    color: colors.primary,
  },
  stockBadgeOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.stock.available,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stockBadgeText: {
    ...typography.badge,
    color: colors.status.success,
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
    fontStyle: 'italic',
  },
  emptyText: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface.white,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    ...typography.label,
    color: colors.text.primary,
  },
  categoryOptionTextSelected: {
    color: colors.text.white,
  },
  priceInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  priceInput: {
    ...typography.body,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  priceSeparator: {
    ...typography.title,
    color: colors.text.secondary,
    marginTop: 24,
  },
  stockOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stockOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface.white,
    borderWidth: 2,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  stockOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stockOptionText: {
    ...typography.label,
    color: colors.text.primary,
  },
  stockOptionTextSelected: {
    color: colors.text.white,
  },
  sortOptionsContainer: {
    gap: 12,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.white,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  sortOptionSelected: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
  },
  sortOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  sortOptionTextSelected: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalResetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface.white,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  modalResetButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  modalApplyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalApplyButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadMoreText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: 8,
  },
});
