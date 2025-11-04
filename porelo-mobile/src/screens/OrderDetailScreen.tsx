/**
 * ÉCRAN DÉTAILS D'UNE COMMANDE
 * 
 * Cet écran affiche les détails complets d'une commande :
 * - Informations de la commande (date, statut, total)
 * - Liste complète des articles avec quantités et prix
 * - Informations utilisateur (si admin)
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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const route = useRoute<OrderDetailScreenRouteProp>();
  const navigation = useNavigation<OrderDetailScreenNavigationProp>();
  const { orderId } = route.params;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  /**
   * Charger les détails de la commande
   */
  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  /**
   * Recharger les détails quand l'écran est focus
   * Utile si le statut a été modifié depuis un autre écran
   */
  useFocusEffect(
    React.useCallback(() => {
      if (orderId) {
        loadOrderDetails();
      }
    }, [orderId])
  );

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement de la commande:', error);
      let errorMessage = 'Impossible de charger les détails de la commande';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert('Erreur', errorMessage, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
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
      weekday: 'long',
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
   * Obtenir l'icône selon le statut
   */
  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'time-outline';
      case 'SHIPPED':
        return 'airplane-outline';
      case 'DELIVERED':
        return 'checkmark-circle-outline';
      case 'CANCELLED':
        return 'close-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  /**
   * Mettre à jour le statut de la commande (admin seulement)
   */
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      await orderService.updateStatus(order.id, { status: newStatus });
      Alert.alert('Succès', 'Statut mis à jour avec succès');
      setStatusModalVisible(false);
      loadOrderDetails(); // Recharger les détails
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Commande non trouvée</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header avec statut */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.orderId}>Commande #{order.id.substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
              isAdmin && styles.statusBadgeClickable,
            ]}
            onPress={isAdmin ? () => setStatusModalVisible(true) : undefined}
            disabled={!isAdmin}
          >
            <Ionicons
              name={getStatusIcon(order.status) as any}
              size={18}
              color={colors.text.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
            {isAdmin && (
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.text.white}
                style={styles.statusChevron}
              />
            )}
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {/* Informations utilisateur (admin seulement) */}
      {isAdmin && (
        <Animatable.View animation="fadeInUp" delay={100} duration={600}>
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoHeader}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={styles.userInfoTitle}>Client</Text>
            </View>
            <Text style={styles.userInfoText}>ID: {order.userID.substring(0, 8)}</Text>
          </View>
        </Animatable.View>
      )}

      {/* Liste des articles */}
      <Animatable.View animation="fadeInUp" delay={200} duration={600}>
        <Text style={styles.sectionTitle}>Articles ({order.orderItems.length})</Text>
        
        {order.orderItems.map((item, index) => (
          <Animatable.View
            key={item.id}
            animation="fadeInLeft"
            delay={300 + index * 100}
            duration={500}
          >
            <View style={styles.orderItemCard}>
              {/* Image du produit */}
              {item.product.imageURL ? (
                <Image
                  source={{ uri: item.product.imageURL }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={24} color={colors.text.light} />
                </View>
              )}

              {/* Informations du produit */}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.productCategory}>
                  {item.product.category?.name || 'Produit'}
                </Text>
                
                <View style={styles.productDetails}>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.productPrice}>
                    {formatPrice(item.price)} / unité
                  </Text>
                </View>
              </View>

              {/* Prix total pour cet article */}
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalLabel}>Sous-total</Text>
                <Text style={styles.itemTotalPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          </Animatable.View>
        ))}
      </Animatable.View>

      {/* Résumé de la commande */}
      <Animatable.View animation="fadeInUp" delay={400} duration={600}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre d'articles</Text>
            <Text style={styles.summaryValue}>
              {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(
                order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
              )}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryValueTotal}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>
      </Animatable.View>

      {/* Timeline du statut (optionnel) */}
      <Animatable.View animation="fadeInUp" delay={500} duration={600}>
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Suivi de commande</Text>
          <View style={styles.timeline}>
            {(['PENDING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((status, index) => {
              const isCompleted = getStatusOrder(status) <= getStatusOrder(order.status);
              const isCurrent = status === order.status;
              
              return (
                <View key={status} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}
                  >
                    {isCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={colors.text.white}
                      />
                    )}
                  </View>
                  {index < 2 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelCompleted,
                      ]}
                    >
                      {getStatusLabel(status)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Animatable.View>

      {/* Modal pour changer le statut (admin seulement) */}
      {isAdmin && (
        <Modal
          visible={statusModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Changer le statut</Text>
                <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Commande #{order.id.substring(0, 8).toUpperCase()}
              </Text>
              <Text style={styles.modalCurrentStatus}>
                Statut actuel: {getStatusLabel(order.status)}
              </Text>

              <View style={styles.statusOptions}>
                {(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        order.status === status && styles.statusOptionSelected,
                        { borderColor: getStatusColor(status) },
                      ]}
                      onPress={() => handleUpdateStatus(status)}
                    >
                      <Ionicons
                        name={getStatusIcon(status) as any}
                        size={20}
                        color={order.status === status ? getStatusColor(status) : colors.text.secondary}
                      />
                      <Text
                        style={[
                          styles.statusOptionText,
                          order.status === status && { color: getStatusColor(status) },
                        ]}
                      >
                        {getStatusLabel(status)}
                      </Text>
                      {order.status === status && (
                        <Ionicons name="checkmark" size={20} color={getStatusColor(status)} />
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

/**
 * Obtenir l'ordre numérique d'un statut pour la timeline
 */
function getStatusOrder(status: OrderStatus): number {
  switch (status) {
    case 'PENDING':
      return 1;
    case 'SHIPPED':
      return 2;
    case 'DELIVERED':
      return 3;
    case 'CANCELLED':
      return 0;
    default:
      return 0;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  errorText: {
    ...typography.sectionTitle,
    color: colors.status.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  headerInfo: {
    flex: 1,
  },
  orderId: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 8,
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusBadgeClickable: {
    paddingRight: 12,
  },
  statusChevron: {
    marginLeft: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    ...typography.label,
    color: colors.text.white,
  },
  userInfoCard: {
    backgroundColor: colors.surface.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  userInfoTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  userInfoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  orderItemCard: {
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
    marginRight: 12,
  },
  productName: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 4,
  },
  productCategory: {
    ...typography.badge,
    color: colors.text.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    ...typography.label,
    color: colors.primary,
  },
  productPrice: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  itemTotal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemTotalLabel: {
    ...typography.badge,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemTotalPrice: {
    ...typography.price,
    color: colors.primary,
  },
  summaryCard: {
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  summaryLabelTotal: {
    ...typography.sectionTitle,
    fontSize: 20,
    color: colors.text.primary,
  },
  summaryValueTotal: {
    ...typography.price,
    fontSize: 28,
    color: colors.primary,
  },
  timelineCard: {
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDotCompleted: {
    backgroundColor: colors.status.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 24,
    backgroundColor: colors.border.light,
  },
  timelineLineCompleted: {
    backgroundColor: colors.status.success,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  timelineLabelCompleted: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Modal styles
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.title,
    color: colors.text.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.surface.white,
  },
  statusOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  statusOptionText: {
    flex: 1,
    ...typography.button,
    color: colors.text.primary,
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

