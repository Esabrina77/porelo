/**
 * ÉCRAN ADMIN - GESTION DES COMMANDES
 * 
 * Cet écran permet aux administrateurs de :
 * - Voir toutes les commandes (pas seulement les leurs)
 * - Modifier le statut des commandes
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type AdminOrdersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminOrders'>;

export default function AdminOrdersScreen() {
  const navigation = useNavigation<AdminOrdersScreenNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  /**
   * Charger toutes les commandes depuis l'API
   */
  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
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

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  /**
   * Mettre à jour le statut d'une commande
   */
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus });
      Alert.alert('Succès', 'Statut mis à jour avec succès');
      setStatusModalVisible(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
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
      month: 'short',
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
        onPress={() => {
          navigation.navigate('OrderDetail', { orderId: item.id });
        }}
        onLongPress={() => {
          setSelectedOrder(item);
          setStatusModalVisible(true);
        }}
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
      </TouchableOpacity>
    </Animatable.View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        }
      />

      {/* Modal pour changer le statut */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setStatusModalVisible(false);
          setSelectedOrder(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Changer le statut</Text>
            {selectedOrder && (
              <>
                <Text style={styles.modalSubtitle}>
                  Commande #{selectedOrder.id.substring(0, 8)}
                </Text>
                <Text style={styles.modalCurrentStatus}>
                  Statut actuel: {getStatusLabel(selectedOrder.status)}
                </Text>

                <View style={styles.statusOptions}>
                  {(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          selectedOrder.status === status && styles.statusOptionSelected,
                          { borderColor: getStatusColor(status) },
                        ]}
                        onPress={() => handleUpdateStatus(selectedOrder.id, status)}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            selectedOrder.status === status && { color: getStatusColor(status) },
                          ]}
                        >
                          {getStatusLabel(status)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setStatusModalVisible(false);
                setSelectedOrder(null);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: colors.surface.card,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    paddingTop: 12,
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.sectionTitle,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface.white,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCurrentStatus: {
    ...typography.label,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusOptions: {
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.surface.white,
  },
  statusOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  statusOptionText: {
    ...typography.button,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
});

