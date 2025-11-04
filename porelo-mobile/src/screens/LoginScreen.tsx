/**
 * ÉCRAN DE CONNEXION
 * 
 * Cet écran permet à l'utilisateur de se connecter avec son email et mot de passe.
 * Après connexion réussie, l'utilisateur est redirigé vers l'écran principal.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Logo from '../components/Logo';

// Type pour la navigation (TypeScript)
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  // Hook d'authentification (contexte)
  const { login } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // État local du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Gérer la soumission du formulaire de connexion
   */
  const handleLogin = async () => {
    // Validation basique
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    try {
      setIsLoading(true);

      // Appeler la fonction de connexion du contexte
      // Le contexte gère automatiquement le stockage du token et la mise à jour de l'état
      await login({ email: email.trim(), password });

      // La navigation vers l'écran principal se fera automatiquement
      // grâce au système de navigation conditionnelle dans App.tsx
    } catch (error: any) {
      // Gérer les erreurs
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.response?.data?.error) {
        // Erreur renvoyée par l'API
        errorMessage = error.response.data.error;
      } else if (error.message) {
        // Erreur réseau ou autre
        errorMessage = error.message;
      }

      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Naviguer vers l'écran d'inscription
   */
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <Logo size="large" variant="full" containerStyle={styles.logoContainer} />
          
          {/* Sous-titre */}
          <Text style={styles.subtitle}>Pure skin, pure you</Text>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Champ Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.text.light}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Champ Mot de passe */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={colors.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Bouton de connexion */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            {/* Lien vers l'inscription */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={navigateToRegister}
              disabled={isLoading}
            >
              <Text style={styles.linkText}>
                Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.white,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    ...typography.body,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.text.white,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  linkBold: {
    ...typography.label,
    color: colors.secondary,
  },
});

