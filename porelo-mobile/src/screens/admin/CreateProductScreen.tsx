/**
 * ÉCRAN ADMIN - CRÉER UN PRODUIT
 * 
 * Cet écran permet aux administrateurs de créer un nouveau produit.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ProductRequest, Category } from '../../types';
import { productService, categoryService } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type CreateProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateProduct'>;

export default function CreateProductScreen() {
  const navigation = useNavigation<CreateProductScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // État du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  /**
   * Charger les catégories pour le sélecteur
   */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des catégories:', error);
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  /**
   * Valider le formulaire
   */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis');
      return false;
    }

    if (!price.trim()) {
      Alert.alert('Erreur', 'Le prix est requis');
      return false;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Erreur', 'Le prix doit être un nombre positif');
      return false;
    }

    if (!stock.trim()) {
      Alert.alert('Erreur', 'Le stock est requis');
      return false;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Erreur', 'Le stock doit être un nombre positif ou zéro');
      return false;
    }

    return true;
  };

  /**
   * Créer le produit
   */
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const productData: ProductRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageURL: imageURL.trim() || undefined,
        categoryID: selectedCategoryId || undefined,
      };

      await productService.create(productData);

      Alert.alert('Succès', 'Produit créé avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Erreur lors de la création du produit:', error);
      let errorMessage = 'Erreur lors de la création du produit';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animatable.View animation="fadeInDown" duration={600}>
        <Text style={styles.title}>Nouveau produit</Text>
        <Text style={styles.subtitle}>Remplissez les informations du produit</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} duration={600} style={styles.form}>
        {/* Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom du produit *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Crème hydratante"
            placeholderTextColor={colors.text.light}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description du produit..."
            placeholderTextColor={colors.text.light}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Prix */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix (€) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 29.99"
            placeholderTextColor={colors.text.light}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            editable={!isLoading}
          />
        </View>

        {/* Stock */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50"
            placeholderTextColor={colors.text.light}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>

        {/* Image URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>URL de l'image</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.text.light}
            value={imageURL}
            onChangeText={setImageURL}
            keyboardType="url"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* Catégorie */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          {isLoadingCategories ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryOption,
                  selectedCategoryId === null && styles.categoryOptionSelected,
                ]}
                onPress={() => setSelectedCategoryId(null)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    selectedCategoryId === null && styles.categoryOptionTextSelected,
                  ]}
                >
                  Aucune catégorie
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategoryId === category.id && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategoryId === category.id && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Boutons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.white} />
            ) : (
              <Text style={styles.createButtonText}>Créer le produit</Text>
            )}
          </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

