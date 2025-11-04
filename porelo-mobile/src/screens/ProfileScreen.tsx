/**
 * ÉCRAN PROFIL
 * 
 * Cet écran affiche les informations de l'utilisateur connecté.
 * L'utilisateur peut :
 * - Voir ses informations (email, rôle)
 * - Se déconnecter
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Logo from '../components/Logo';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  /**
   * Gérer la déconnexion avec confirmation
   */
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navigation vers l'écran de login se fera automatiquement
              // grâce au système de navigation conditionnelle dans App.tsx
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
            }
          },
        },
      ]
    );
  };

  /**
   * Obtenir le label du rôle en français
   */
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'USER':
        return 'Utilisateur';
      default:
        return role;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header avec logo */}
      <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
        <Logo size="medium" variant="icon" />
        <Text style={styles.welcomeText}>Bienvenue</Text>
      </Animatable.View>

      {/* Informations utilisateur */}
      <Animatable.View animation="fadeInUp" delay={200} duration={600} style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Non disponible'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Rôle</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role ? getRoleLabel(user.role) : 'Non disponible'}
            </Text>
          </View>
        </View>
      </Animatable.View>

      {/* Actions */}
      <Animatable.View animation="fadeInUp" delay={400} duration={600} style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Informations de l'app */}
      <Animatable.View animation="fadeIn" delay={600} duration={600} style={styles.footer}>
        <Text style={styles.footerText}>PORELO</Text>
        <Text style={styles.footerSubtext}>Pure skin, pure you</Text>
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
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    ...typography.title,
    color: colors.text.primary,
    marginTop: 15,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  infoValue: {
    ...typography.sectionTitle,
    color: colors.text.primary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  roleText: {
    ...typography.label,
    color: colors.text.white,
  },
  actionsSection: {
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: colors.status.error,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.text.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  footerSubtext: {
    ...typography.badge,
    color: colors.text.light,
  },
});

