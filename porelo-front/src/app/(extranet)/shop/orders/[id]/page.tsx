"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderById } from '@/api/services/orderService';
import { Order } from '@/api/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadOrder();
    }
  }, [isAuthenticated, authLoading, orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      if (err.statusCode === 401) {
        logout();
        router.push('/login');
      } else {
        setError(err.message || 'Erreur lors du chargement de la commande');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'SHIPPED':
        return '#3b82f6';
      case 'DELIVERED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Commande non trouvée'}
        </div>
        <Link href="/shop/orders" className={styles.backLink}>
          ← Retour aux commandes
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/shop/orders" className={styles.backLink}>
        ← Retour aux commandes
      </Link>

      <div className={styles.orderHeader}>
        <div>
          <h1>Commande #{order.id.slice(0, 8)}</h1>
          <p className={styles.orderDate}>
            Passée le {new Date(order.orderDate).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>

      <div className={styles.orderContent}>
        <div className={styles.itemsSection}>
          <h2>Articles commandés</h2>
          <div className={styles.itemsList}>
            {order.orderItems.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  {item.product.imageURL ? (
                    <img src={item.product.imageURL} alt={item.product.name} />
                  ) : (
                    <div className={styles.placeholderImage}>Pas d'image</div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <Link href={`/shop/products/${item.product.id}`}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                  </Link>
                  <p className={styles.itemDescription}>{item.product.description}</p>
                  <div className={styles.itemMeta}>
                    <span>Quantité : {item.quantity}</span>
                    <span>Prix unitaire : {item.price.toFixed(2)} €</span>
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  {(item.price * item.quantity).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summarySection}>
          <h2>Résumé</h2>
          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>Nombre d'articles</span>
              <span>{order.orderItems.length}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total</span>
              <span className={styles.totalAmount}>
                {order.totalAmount.toFixed(2)} €
              </span>
            </div>
            <div className={styles.summaryInfo}>
              <p>
                <strong>Date de commande :</strong><br />
                {new Date(order.orderDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <strong>Statut :</strong><br />
                {getStatusLabel(order.status)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

