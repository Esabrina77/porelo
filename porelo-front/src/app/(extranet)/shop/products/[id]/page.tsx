"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { getProductById } from '@/api/services/productService';
import { getProductReviews, createReview } from '@/api/services/reviewService';
import { Product, ProductReviewsResponse, Review } from '@/api/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { addItem } = useCart();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Formulaire d'avis
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadProduct();
      loadReviews();
    }
  }, [isAuthenticated, authLoading, productId, router]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des avis:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock < quantity) {
      alert(`Stock insuffisant. Il ne reste que ${product.stock} produit(s).`);
      return;
    }

    setAddingToCart(true);
    try {
      addItem(product, quantity);
      alert(`${quantity} produit(s) ajouté(s) au panier !`);
      setQuantity(1);
    } catch (err) {
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    setSubmittingReview(true);
    try {
      await createReview({
        productID: product.id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });

      // Recharger les avis
      await loadReviews();

      // Réinitialiser le formulaire
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      alert('Votre avis a été ajouté avec succès !');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (authLoading || loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (error || !product) {
    return (
      <div className={styles.error}>
        <p>{error || 'Produit non trouvé'}</p>
        <Link href="/shop/products" className={styles.backLink}>
          ← Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/shop/products" className={styles.backLink}>
        ← Retour aux produits
      </Link>

      <div className={styles.productSection}>
        <div className={styles.productImage}>
          {product.imageURL ? (
            <img src={product.imageURL} alt={product.name} />
          ) : (
            <div className={styles.placeholderImage}>Pas d&apos;image</div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>

          {product.category && (
            <p className={styles.category}>
              Catégorie : {product.category.name}
            </p>
          )}

          <div className={styles.priceSection}>
            <span className={styles.price}>{product.price.toFixed(2)} €</span>
            {product.stock > 0 ? (
              <span className={styles.inStock}>En stock ({product.stock})</span>
            ) : (
              <span className={styles.outOfStock}>Rupture de stock</span>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.purchaseSection}>
            <div className={styles.quantitySelector}>
              <label htmlFor="quantity">Quantité :</label>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className={styles.addToCartButton}
            >
              {addingToCart ? 'Ajout...' : 'Ajouter au panier'}
            </button>
          </div>
        </div>
      </div>

      {/* Section Avis */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2>Avis clients</h2>
          {reviews && (
            <div className={styles.reviewsSummary}>
              <span className={styles.averageRating}>
                {reviews.averageRating.toFixed(1)} / 5
              </span>
              <span className={styles.totalReviews}>
                ({reviews.totalReviews} avis)
              </span>
            </div>
          )}
        </div>

        {isAuthenticated && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className={styles.addReviewButton}
          >
            Ajouter un avis
          </button>
        )}

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
            <h3>Votre avis</h3>
            <div className={styles.ratingInput}>
              <label>Note :</label>
              <div className={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={star <= reviewRating ? styles.starActive : styles.star}
                  >
                    ★
                  </button>
                ))}
                <span>{reviewRating} / 5</span>
              </div>
            </div>
            <div className={styles.commentInput}>
              <label htmlFor="comment">Commentaire (optionnel) :</label>
              <textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Partagez votre expérience..."
              />
            </div>
            <div className={styles.reviewFormActions}>
              <button type="submit" disabled={submittingReview}>
                {submittingReview ? 'Envoi...' : 'Publier'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewComment('');
                  setReviewRating(5);
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {reviews && reviews.reviews.length > 0 ? (
          <div className={styles.reviewsList}>
            {reviews.reviews.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAuthor}>{review.userEmail}</span>
                  <span className={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </span>
                  <span className={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.comment && (
                  <p className={styles.reviewComment}>{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>Aucun avis pour le moment.</p>
        )}
      </div>
    </div>
  );
}

