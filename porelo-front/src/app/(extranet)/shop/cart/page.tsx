"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/api/services/orderService';
import Link from 'next/link';
import styles from './page.module.css';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    setCreatingOrder(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        productID: item.product.id,
        quantity: item.quantity,
      }));

      const order = await createOrder({ items: orderItems });

      // Vider le panier après commande réussie
      clearCart();

      // Rediriger vers la page de confirmation
      router.push(`/shop/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la commande');
    } finally {
      setCreatingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1>Panier</h1>
        <div className={styles.emptyCart}>
          <p>Votre panier est vide</p>
          <Link href="/shop/products" className={styles.shopLink}>
            Continuer vos achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Panier</h1>
        <Link href="/shop/products" className={styles.continueShopping}>
          ← Continuer vos achats
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.cartContent}>
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.product.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                {item.product.imageURL ? (
                  <img src={item.product.imageURL} alt={item.product.name} />
                ) : (
                  <div className={styles.placeholderImage}>Pas d&apos;image</div>
                )}
              </div>

              <div className={styles.itemInfo}>
                <Link href={`/shop/products/${item.product.id}`}>
                  <h3 className={styles.itemName}>{item.product.name}</h3>
                </Link>
                <p className={styles.itemPrice}>{item.product.price.toFixed(2)} €</p>
                {item.product.category && (
                  <p className={styles.itemCategory}>{item.product.category.name}</p>
                )}
              </div>

              <div className={styles.itemQuantity}>
                <label htmlFor={`quantity-${item.product.id}`}>Quantité :</label>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    id={`quantity-${item.product.id}`}
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      updateQuantity(item.product.id, Math.min(newQuantity, item.product.stock));
                    }}
                  />
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>
                <p className={styles.stockInfo}>
                  Stock disponible : {item.product.stock}
                </p>
              </div>

              <div className={styles.itemTotal}>
                <p className={styles.subtotal}>
                  {(item.product.price * item.quantity).toFixed(2)} €
                </p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className={styles.removeButton}
                  aria-label="Retirer du panier"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2>Résumé de la commande</h2>
          <div className={styles.summaryRow}>
            <span>Articles ({items.length})</span>
            <span>{getTotalPrice().toFixed(2)} €</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Total</span>
            <span className={styles.totalPrice}>{getTotalPrice().toFixed(2)} €</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={creatingOrder || items.length === 0}
            className={styles.checkoutButton}
          >
            {creatingOrder ? 'Traitement...' : 'Passer la commande'}
          </button>
          <button
            onClick={clearCart}
            className={styles.clearButton}
          >
            Vider le panier
          </button>
        </div>
      </div>
    </div>
  );
}

