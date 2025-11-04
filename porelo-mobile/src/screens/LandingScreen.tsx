/**
 * ÉCRAN LANDING PAGE
 * 
 * Page d'accueil moderne et attractive pour présenter l'application PORELO.
 * Affiche le logo, un message d'accueil, et des boutons pour se connecter ou s'inscrire.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Logo from '../components/Logo';

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Section principale avec logo et message */}
      <Animatable.View 
        animation="fadeInDown" 
        duration={800}
        style={styles.heroSection}
      >
        {/* Logo */}
        <Logo size="large" variant="full" containerStyle={styles.logoContainer} />
        
        {/* Titre principal */}
        <Animatable.View 
          animation="fadeInUp" 
          delay={200}
          duration={800}
        >
          {/* <Text style={styles.title}>Bienvenue sur PORELO</Text> */}
          <Text style={styles.slogan}>
            Pure skin, pure you
          </Text>
        </Animatable.View>
      </Animatable.View>

      {/* Section features avec icônes */}
      <Animatable.View 
        animation="fadeInUp" 
        delay={400}
        duration={800}
        style={styles.featuresSection}
      >
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="leaf-outline" size={28} color={colors.status.success} />
          </View>
          <Text style={styles.featureTitle}>100% Naturel</Text>
          <Text style={styles.featureText}>
            Produits respectueux de votre peau et de l'environnement
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="heart-outline" size={28} color={colors.accent} />
          </View>
          <Text style={styles.featureTitle}>Soins Doux</Text>
          <Text style={styles.featureText}>
            Formulés pour prendre soin de vous en toute douceur
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Qualité Premium</Text>
          <Text style={styles.featureText}>
            Sélection rigoureuse de produits d'exception
          </Text>
        </View>
      </Animatable.View>

      {/* Boutons d'action */}
      <Animatable.View 
        animation="fadeInUp" 
        delay={600}
        duration={800}
        style={styles.actionsSection}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={navigateToLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Se connecter</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={navigateToRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Créer un compte</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 30,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  slogan: {
    ...typography.subtitle,
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 1,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 50,
    gap: 30,
  },
  featureItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    ...typography.sectionTitle,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsSection: {
    gap: 16,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: colors.surface.white,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 18,
  },
});

