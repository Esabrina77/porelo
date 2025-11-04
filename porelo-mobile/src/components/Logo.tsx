/**
 * COMPOSANT LOGO
 * 
 * Ce composant affiche le logo PORELO.
 * Il peut afficher soit le logo complet (porelo.png) soit le logo tronqué (p_tronc.png).
 * 
 * Utilisation:
 * <Logo size="large" variant="full" />
 * <Logo size="small" variant="icon" />
 */

import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

// Import des logos
const LogoFull = require('../../assets/logo/porelo.png');
const LogoIcon = require('../../assets/logo/p_tronc.png');

interface LogoProps {
  /**
   * Taille du logo
   * - small: Pour les icônes, headers compacts
   * - medium: Taille standard
   * - large: Pour les écrans d'accueil, splash screens
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Variante du logo
   * - full: Logo complet "Porelo" (porelo.png)
   * - icon: Logo tronqué P + plume (p_tronc.png) - parfait pour l'icône d'app
   */
  variant?: 'full' | 'icon';
  
  /**
   * Style personnalisé pour le conteneur
   */
  containerStyle?: ViewStyle;
  
  /**
   * Style personnalisé pour l'image
   */
  imageStyle?: ImageStyle;
}

/**
 * Composant Logo
 * 
 * Affiche le logo PORELO avec différentes tailles et variantes.
 */
export default function Logo({
  size = 'medium',
  variant = 'full',
  containerStyle,
  imageStyle,
}: LogoProps) {
  // Sélectionner le logo selon la variante
  const logoSource = variant === 'full' ? LogoFull : LogoIcon;
  
  // Définir les dimensions selon la taille
  const dimensions = {
    small: { width: 40, height: 40 },
    medium: { width: 150, height: 150 },
    large: { width: 250, height: 250 },
  }[size];
  
  // Si c'est le logo complet, ajuster les dimensions (aspect ratio différent)
  const finalDimensions = variant === 'full' 
    ? { width: dimensions.width, height: dimensions.width * 0.3 } // Ratio approximatif
    : dimensions;
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={logoSource}
        style={[
          {
            width: finalDimensions.width,
            height: finalDimensions.height,
          },
          imageStyle,
        ]}
        resizeMode="contain" // Garde les proportions
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

