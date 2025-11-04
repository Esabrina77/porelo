/**
 * ÉCRAN ADMIN - GESTION DES CATÉGORIES
 * 
 * Cet écran permet aux administrateurs de gérer les catégories :
 * - Voir toutes les catégories
 * - Créer une nouvelle catégorie
 * - Modifier une catégorie
 * - Supprimer une catégorie
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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Category } from '../../types';
import { categoryService } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  /**
   * Charger les catégories depuis l'API
   */
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      let errorMessage = 'Impossible de charger les catégories';
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
    loadCategories();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCategories();
  };

  /**
   * Ouvrir le modal pour créer une catégorie
   */
  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  /**
   * Ouvrir le modal pour modifier une catégorie
   */
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  /**
   * Sauvegarder la catégorie (création ou modification)
   */
  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie ne peut pas être vide');
      return;
    }

    try {
      if (editingCategory) {
        // Modification
        await categoryService.update(editingCategory.id, { name: categoryName.trim() });
        Alert.alert('Succès', 'Catégorie modifiée avec succès');
      } else {
        // Création
        await categoryService.create({ name: categoryName.trim() });
        Alert.alert('Succès', 'Catégorie créée avec succès');
      }
      setModalVisible(false);
      setCategoryName('');
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      let errorMessage = 'Erreur lors de la sauvegarde';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert('Erreur', errorMessage);
    }
  };

  /**
   * Supprimer une catégorie avec confirmation
   */
  const handleDelete = (category: Category) => {
    Alert.alert(
      'Supprimer la catégorie',
      `Êtes-vous sûr de vouloir supprimer "${category.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.delete(category.id);
              Alert.alert('Succès', 'Catégorie supprimée avec succès');
              loadCategories();
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
            }
          },
        },
      ]
    );
  };

  /**
   * Rendre un item de la liste
   */
  const renderCategoryItem = ({ item, index }: { item: Category; index: number }) => (
    <Animatable.View
      animation="fadeInLeft"
      delay={index * 100}
      duration={500}
      style={{ marginBottom: 12 }}
    >
      <View style={styles.categoryCard}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des catégories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreate}
      >
        <Ionicons name="add" size={24} color={colors.text.white} />
        <Text style={styles.addButtonText}>Ajouter une catégorie</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        renderItem={({ item, index }) => renderCategoryItem({ item, index })}
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
            <Text style={styles.emptyText}>Aucune catégorie</Text>
          </View>
        }
      />

      {/* Modal pour créer/modifier */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setCategoryName('');
          setEditingCategory(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nom de la catégorie"
              placeholderTextColor={colors.text.light}
              value={categoryName}
              onChangeText={setCategoryName}
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setCategoryName('');
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Modifier' : 'Créer'}
                </Text>
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    margin: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryName: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.status.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    marginBottom: 20,
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
});

