/**
 * ÉCRAN DE DÉTAILS D'UN PRODUIT
 * 
 * Cet écran affiche les informations complètes d'un produit :
 * - Image
 * - Nom, description
 * - Prix
 * - Stock
 * - Catégorie
 * - Possibilité d'ajouter au panier (futur)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Product, Review, ProductReviewsResponse } from '../types';
import { productService, reviewService } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import Toast from 'react-native-toast-message';
import { Share } from 'react-native';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // États pour les avis
  const [reviews, setReviews] = useState<ProductReviewsResponse | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  /**
   * Charger les détails du produit depuis l'API
   */
  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getById(productId);
      setProduct(data);
      
      // Charger les avis après avoir chargé le produit
      await loadReviews();
    } catch (error: any) {
      console.error('Erreur lors du chargement du produit:', error);
      
      let errorMessage = 'Impossible de charger le produit';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charger les avis du produit
   */
  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      
      // Charger tous les avis et l'avis de l'utilisateur en parallèle
      const [reviewsData, myReviewData] = await Promise.all([
        reviewService.getProductReviews(productId),
        reviewService.getMyReview(productId),
      ]);
      
      setReviews(reviewsData);
      setMyReview(myReviewData);
      
      // Si l'utilisateur a déjà un avis, pré-remplir le formulaire
      if (myReviewData) {
        setRating(myReviewData.rating);
        setComment(myReviewData.comment || '');
        setShowReviewForm(true);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  /**
   * Soumettre un avis (créer ou mettre à jour)
   */
  const handleSubmitReview = async () => {
    if (!product) return;

    if (rating < 1 || rating > 5) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez sélectionner une note entre 1 et 5 étoiles.',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsSubmittingReview(true);

      const reviewData = {
        productID: product.id,
        rating,
        comment: comment.trim() || undefined,
      };

      await reviewService.createOrUpdateReview(product.id, reviewData);

      Toast.show({
        type: 'success',
        text1: 'Avis enregistré',
        text2: 'Votre avis a été enregistré avec succès.',
        position: 'bottom',
      });

      // Recharger les avis
      await loadReviews();
      setShowReviewForm(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de l\'avis:', error);
      
      let errorMessage = 'Impossible d\'enregistrer l\'avis';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
        position: 'bottom',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  /**
   * Supprimer un avis
   */
  const handleDeleteReview = async () => {
    if (!myReview) return;

    Alert.alert(
      'Supprimer l\'avis',
      'Êtes-vous sûr de vouloir supprimer votre avis ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewService.deleteReview(myReview.id);
              
              Toast.show({
                type: 'success',
                text1: 'Avis supprimé',
                text2: 'Votre avis a été supprimé.',
                position: 'bottom',
              });

              // Recharger les avis
              await loadReviews();
              setShowReviewForm(false);
              setRating(5);
              setComment('');
            } catch (error: any) {
              console.error('Erreur lors de la suppression de l\'avis:', error);
              
              Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de supprimer l\'avis.',
                position: 'bottom',
              });
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
   * Gérer l'ajout au panier
   */
  const handleAddToCart = () => {
    if (!product) return;

    // Vérifier le stock
    if (product.stock <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Stock insuffisant',
        text2: 'Ce produit n\'est plus disponible.',
        position: 'bottom',
      });
      return;
    }

    // Vérifier que la quantité ne dépasse pas le stock
    const currentQuantity = getQuantity(product.id);
    if (currentQuantity + quantity > product.stock) {
      Toast.show({
        type: 'error',
        text1: 'Stock insuffisant',
        text2: `Vous ne pouvez pas ajouter plus de ${product.stock} unité(s).`,
        position: 'bottom',
      });
      return;
    }

    // Ajouter au panier
    addToCart(product, quantity);
    
    Toast.show({
      type: 'success',
      text1: 'Produit ajouté',
      text2: `${product.name} (x${quantity}) a été ajouté au panier.`,
      position: 'bottom',
    });
  };

  /**
   * Diminuer la quantité
   */
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  /**
   * Augmenter la quantité
   */
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (product) {
      Toast.show({
        type: 'info',
        text1: 'Stock maximum',
        text2: `Stock disponible: ${product.stock}`,
        position: 'bottom',
      });
    }
  };

  /**
   * Partager le produit
   */
  const handleShareProduct = async () => {
    if (!product) return;

    const shareMessage = `Découvrez ${product.name} sur PORELO !\n\n${product.description || 'Produit de qualité'}\n\nPrix: ${formatPrice(product.price)}\n\nPure skin, pure you ✨`;

    try {
      const result = await Share.share({
        message: shareMessage,
        title: product.name,
      });

      if (result.action === Share.sharedAction) {
        Toast.show({
          type: 'success',
          text1: 'Partagé !',
          text2: 'Le produit a été partagé avec succès',
          position: 'bottom',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du partage:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.message || 'Impossible de partager le produit',
        position: 'bottom',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Produit non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section image principale - style moderne */}
      <Animatable.View animation="fadeInDown" duration={600} style={styles.imageSection}>
        {product.imageURL ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: product.imageURL }} style={styles.image} />
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={60} color={colors.text.light} />
          </View>
        )}

        {/* Boutons d'action (header) */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={() => {
              if (product) {
                toggleFavorite(product);
                Toast.show({
                  type: isFavorite(product.id) ? 'info' : 'success',
                  text1: isFavorite(product.id) ? 'Retiré des favoris' : 'Ajouté aux favoris',
                  text2: product.name,
                  position: 'bottom',
                });
              }
            }}
          >
            <Ionicons
              name={product && isFavorite(product.id) ? "heart" : "heart-outline"}
              size={24}
              color={product && isFavorite(product.id) ? colors.status.error : colors.text.secondary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleShareProduct}
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Badges produits (à gauche) */}
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Ionicons name="leaf-outline" size={14} color={colors.status.success} />
            <Text style={styles.badgeText}>Naturel</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100% Soin</Text>
          </View>
        </View>
      </Animatable.View>

      {/* Informations du produit - style épuré */}
      <Animatable.View animation="fadeInUp" delay={200} duration={600} style={styles.content}>
        {/* Ratings (moyenne réelle des avis) */}
        {reviews && reviews.totalReviews > 0 && (
          <View style={styles.ratingsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.primary} />
              <Text style={styles.ratingText}>{reviews.averageRating.toFixed(1)}</Text>
              <Text style={styles.ratingLabel}>
                ({reviews.totalReviews} avis{reviews.totalReviews > 1 ? '' : ''})
              </Text>
            </View>
          </View>
        )}

        {/* Nom et catégorie */}
        <Text style={styles.name}>{product.name}</Text>
        {product.category && (
          <Text style={styles.volume}>{product.category.name}</Text>
        )}

        {/* Badge Best Seller */}
        {product.stock > 5 && (
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </View>
        )}

        {/* Description */}
        {product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}

        {/* Section prix et quantité */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          
          {/* Sélecteur de quantité moderne */}
          {product.stock > 0 && (
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? colors.text.light : colors.text.primary}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
                disabled={quantity >= product.stock}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= product.stock ? colors.text.light : colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stock */}
        {product.stock > 0 ? (
          <View style={styles.stockInfo}>
            <Ionicons name="checkmark-circle" size={18} color={colors.status.success} />
            <Text style={styles.stockText}>
              {product.stock} unité{product.stock > 1 ? 's' : ''} disponible{product.stock > 1 ? 's' : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.stockInfo}>
            <Ionicons name="close-circle" size={18} color={colors.status.error} />
            <Text style={[styles.stockText, styles.stockTextUnavailable]}>
              Rupture de stock
            </Text>
          </View>
        )}

        {/* Bouton d'ajout au panier moderne */}
        {product.stock > 0 && (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={22} color={colors.text.white} />
            <Text style={styles.addToCartText}>Ajouter au panier</Text>
          </TouchableOpacity>
        )}

        {/* Section Avis */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Avis et notes</Text>
            {reviews && reviews.totalReviews > 0 && (
              <Text style={styles.reviewsCount}>
                {reviews.totalReviews} avis{reviews.totalReviews > 1 ? '' : ''}
              </Text>
            )}
          </View>

          {/* Formulaire d'avis */}
          <View style={styles.reviewFormContainer}>
            {!showReviewForm ? (
              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => setShowReviewForm(true)}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.writeReviewButtonText}>
                  {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Animatable.View animation="fadeInUp" duration={300} style={styles.reviewForm}>
                <Text style={styles.reviewFormTitle}>
                  {myReview ? 'Modifier votre avis' : 'Votre avis'}
                </Text>

                {/* Sélecteur d'étoiles */}
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={32}
                        color={star <= rating ? colors.primary : colors.text.light}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Champ commentaire */}
                <TextInput
                  style={styles.commentInput}
                  placeholder="Partagez votre expérience (optionnel)..."
                  placeholderTextColor={colors.text.light}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                {/* Boutons d'action */}
                <View style={styles.reviewFormActions}>
                  {myReview && (
                    <TouchableOpacity
                      style={styles.deleteReviewButton}
                      onPress={handleDeleteReview}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                      <Text style={styles.deleteReviewButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.reviewFormActionsRight}>
                    <TouchableOpacity
                      style={styles.cancelReviewButton}
                      onPress={() => {
                        setShowReviewForm(false);
                        if (!myReview) {
                          setRating(5);
                          setComment('');
                        }
                      }}
                    >
                      <Text style={styles.cancelReviewButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitReviewButton, isSubmittingReview && styles.submitReviewButtonDisabled]}
                      onPress={handleSubmitReview}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <ActivityIndicator size="small" color={colors.text.white} />
                      ) : (
                        <Text style={styles.submitReviewButtonText}>Enregistrer</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            )}
          </View>

          {/* Liste des avis */}
          {isLoadingReviews ? (
            <View style={styles.reviewsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.reviewsLoadingText}>Chargement des avis...</Text>
            </View>
          ) : reviews && reviews.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.reviews.map((review) => (
                <Animatable.View
                  key={review.id}
                  animation="fadeInUp"
                  delay={50}
                  style={styles.reviewItem}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <View style={styles.reviewUserAvatar}>
                        <Text style={styles.reviewUserAvatarText}>
                          {review.userEmail.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.reviewUserEmail}>{review.userEmail}</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? "star" : "star-outline"}
                              size={14}
                              color={star <= review.rating ? colors.primary : colors.text.light}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </Animatable.View>
              ))}
            </View>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.text.light} />
              <Text style={styles.noReviewsText}>Aucun avis pour le moment</Text>
              <Text style={styles.noReviewsSubtext}>
                Soyez le premier à laisser un avis sur ce produit !
              </Text>
            </View>
          )}
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageSection: {
    width: '100%',
    height: 400,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
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
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgesContainer: {
    position: 'absolute',
    left: 20,
    top: 20,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    ...typography.badge,
    color: colors.text.primary,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  ratingsRow: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginRight: 4,
  },
  ratingLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  name: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 8,
  },
  volume: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  bestSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.status.success,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  bestSellerText: {
    ...typography.badge,
    color: colors.text.white,
    textTransform: 'uppercase',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 26,
    marginBottom: 32,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  price: {
    ...typography.price,
    fontSize: 32,
    fontFamily: typography.price.fontFamily,
    color: colors.primary,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  quantityText: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 12,
  },
  stockText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  stockTextUnavailable: {
    color: colors.status.error,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartText: {
    ...typography.button,
    fontSize: 18,
    fontFamily: typography.button.fontFamily,
    color: colors.text.white,
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
  errorText: {
    ...typography.sectionTitle,
    color: colors.status.error,
  },
  // Styles pour les avis
  reviewsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewsTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    fontSize: 20,
  },
  reviewsCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  reviewFormContainer: {
    marginBottom: 24,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  writeReviewButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  reviewForm: {
    backgroundColor: colors.surface.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewFormTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    ...typography.body,
    backgroundColor: colors.surface.backgroundSoft,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  reviewFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewFormActionsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  deleteReviewButtonText: {
    ...typography.bodySmall,
    color: colors.status.error,
  },
  cancelReviewButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.surface.white,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelReviewButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  submitReviewButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  submitReviewButtonDisabled: {
    opacity: 0.6,
  },
  submitReviewButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  reviewsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  reviewsLoadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewUserAvatarText: {
    ...typography.sectionTitle,
    color: colors.primary,
    fontSize: 16,
  },
  reviewUserEmail: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    ...typography.badge,
    color: colors.text.light,
    fontSize: 11,
  },
  reviewComment: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  noReviewsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noReviewsText: {
    ...typography.sectionTitle,
    color: colors.text.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsSubtext: {
    ...typography.bodySmall,
    color: colors.text.light,
    textAlign: 'center',
  },
});

