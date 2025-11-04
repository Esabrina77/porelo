/**
 * ÉCRAN COMMANDES
 * 
 * Cet écran affiche l'historique des commandes de l'utilisateur.
 * L'utilisateur peut voir :
 * - Toutes ses commandes passées
 * - Le statut de chaque commande (PENDING, SHIPPED, DELIVERED, CANCELLED)
 * - Les détails d'une commande
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Order, OrderStatus } from '../types';
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

// Type pour la navigation Stack (pour OrderDetail)
type OrdersStackNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;
type OrdersScreenNavigationProp = BottomTabNavigationProp<MainTabsParamList, 'Orders'> & OrdersStackNavigationProp;

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Charger les commandes depuis l'API
   */
  const loadOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      // Trier par date (plus récent en premier)
      const sortedData = data.sort(
        (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      setOrders(sortedData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des commandes:', error);
      
      let errorMessage = 'Impossible de charger les commandes';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Charger les commandes au montage du composant
   */
  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Recharger les commandes quand l'écran est focus
   * Cela permet de rafraîchir après avoir créé une commande
   */
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  /**
   * Gérer le pull-to-refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  /**
   * Formater le prix
   */
  const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} €`;
  };

  /**
   * Formater la date
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtenir la couleur selon le statut
   */
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING':
        return colors.status.warning;
      case 'SHIPPED':
        return colors.status.info;
      case 'DELIVERED':
        return colors.status.success;
      case 'CANCELLED':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  /**
   * Traduire le statut en français
   */
  const getStatusLabel = (status: OrderStatus): string => {
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

  /**
   * Naviguer vers les détails d'une commande
   */
  const navigateToOrderDetail = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  /**
   * Rendre un item de la liste
   */
  const renderOrderItem = ({ item, index }: { item: Order; index: number }) => (
    <Animatable.View
      key={item.id}
      animation="fadeInRight"
      delay={index * 100}
      duration={500}
    >
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigateToOrderDetail(item.id)}
        activeOpacity={0.7}
      >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
          <Text style={styles.orderId}>Commande #{item.id.substring(0, 8)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderItems}>
          {item.orderItems.length} article{item.orderItems.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.orderTotal}>{formatPrice(item.totalAmount)}</Text>
      </View>

      {/* Liste des produits (limité à 3) */}
      {item.orderItems.slice(0, 3).map((orderItem, index) => (
        <Text key={index} style={styles.productName} numberOfLines={1}>
          • {orderItem.product.name} x{orderItem.quantity}
        </Text>
      ))}
      {item.orderItems.length > 3 && (
        <Text style={styles.moreItems}>+{item.orderItems.length - 3} autre(s)</Text>
      )}
      </TouchableOpacity>
    </Animatable.View>
  );

  // Écran de chargement initial
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  // Liste vide
  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Aucune commande</Text>
        <Text style={styles.emptySubtext}>
          Vous n'avez pas encore passé de commande.
        </Text>
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
      <FlatList
        data={orders}
        renderItem={({ item, index }) => renderOrderItem({ item, index })}
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
  listContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderDate: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 4,
  },
  orderId: {
    ...typography.badge,
    color: colors.text.light,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...typography.badge,
    color: colors.text.white,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  orderItems: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  orderTotal: {
    ...typography.price,
    color: colors.primary,
  },
  productName: {
    ...typography.badge,
    color: colors.text.secondary,
    marginTop: 4,
  },
  moreItems: {
    ...typography.badge,
    color: colors.text.light,
    fontStyle: 'italic',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
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

