"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/api/services/orderService';
import { Order } from '@/api/types';
import Link from 'next/link';
import styles from './page.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserOrders();
      // Trier par date de création (plus récent en premier)
      const sortedOrders = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err: any) {
      if (err.statusCode === 401) {
        logout();
        router.push('/login');
      } else {
        setError(err.message || 'Erreur lors du chargement des commandes');
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

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={loadOrders} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mes commandes</h1>
        <Link href="/shop/products" className={styles.backLink}>
          ← Retour aux produits
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <p>Vous n'avez aucune commande pour le moment.</p>
          <Link href="/shop/products" className={styles.shopLink}>
            Commencer vos achats
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/shop/orders/${order.id}`}
              className={styles.orderCard}
            >
              <div className={styles.orderHeader}>
                <div>
                  <h3>Commande #{order.id.slice(0, 8)}</h3>
                  <p className={styles.orderDate}>
                    {new Date(order.orderDate).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
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

              <div className={styles.orderDetails}>
                <div className={styles.orderItems}>
                  <p className={styles.itemsCount}>
                    {order.orderItems.length} article{order.orderItems.length > 1 ? 's' : ''}
                  </p>
                  <div className={styles.itemsPreview}>
                    {order.orderItems.slice(0, 3).map((item) => (
                      <span key={item.id} className={styles.itemPreview}>
                        {item.product.name} x{item.quantity}
                      </span>
                    ))}
                    {order.orderItems.length > 3 && (
                      <span className={styles.moreItems}>
                        +{order.orderItems.length - 3} autre(s)
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Total :</span>
                  <span className={styles.totalAmount}>
                    {order.totalAmount.toFixed(2)} €
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

