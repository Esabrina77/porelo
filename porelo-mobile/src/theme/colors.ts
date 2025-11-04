/**
 * CHARTE DE COULEURS - PORELO
 * 
 * Ce fichier centralise toutes les couleurs de l'application.
 * Utilisez ces couleurs pour maintenir la cohérence visuelle.
 * 
 * Palette de couleurs PORELO :
 */

export const colors = {
  // ============================================
  // COULEURS PRINCIPALES
  // ============================================
  
  /**
   * Fond principal - Blanc doux pour un look moderne et épuré
   * Anciennement #F7F6CF (jaune), remplacé par blanc pour plus de modernité
   */
  background: '#FFFFFF',
  
  /**
   * #B6D8F2 - Bleu clair
   * Couleur secondaire, utilisée pour les éléments interactifs, badges
   */
  primaryLight: '#B6D8F2',
  
  /**
   * #F4CFDF - Rose clair
   * Couleur d'accent, utilisée pour les éléments spéciaux
   */
  accent: '#F4CFDF',
  
  /**
   * #5784BA - Bleu foncé
   * Couleur principale, utilisée pour les boutons principaux, headers
   */
  primary: '#5784BA',
  
  /**
   * #9AC8EB - Bleu moyen
   * Couleur pour les boutons secondaires, liens
   */
  secondary: '#9AC8EB',
  
  // ============================================
  // COULEURS UTILITAIRES
  // ============================================
  
  /**
   * Couleurs de texte
   */
  text: {
    primary: '#333333',      // Texte principal (noir doux)
    secondary: '#666666',    // Texte secondaire (gris moyen)
    light: '#999999',        // Texte désactivé/tertiaire (gris clair)
    white: '#FFFFFF',        // Texte sur fond sombre
  },
  
  /**
   * Couleurs d'état
   */
  status: {
    success: '#4CAF50',      // Vert pour succès
    error: '#F44336',        // Rouge pour erreurs
    warning: '#FF9800',      // Orange pour avertissements
    info: '#2196F3',         // Bleu pour informations
  },
  
  /**
   * Couleurs pour le stock
   */
  stock: {
    available: '#E8F5E9',    // Fond vert clair pour stock disponible
    unavailable: '#FFEBEE',  // Fond rouge clair pour rupture de stock
    text: '#333333',         // Texte pour le badge de stock
  },
  
  /**
   * Couleurs de fond
   */
  surface: {
    white: '#FFFFFF',        // Fond blanc pour les cartes
    light: '#F8F9FA',        // Fond gris très clair (légèrement teinté)
    card: '#FFFFFF',         // Fond pour les cartes de produit
    backgroundSoft: '#F5F7FA', // Fond doux alternatif
  },
  
  /**
   * Bordures et séparateurs
   */
  border: {
    light: '#E0E0E0',       // Bordure claire
    medium: '#CCCCCC',      // Bordure moyenne
    dark: '#999999',        // Bordure sombre
  },
  
  /**
   * Ombres (utilisées dans les styles)
   */
  shadow: {
    color: '#000000',       // Couleur de l'ombre
    opacity: 0.1,           // Opacité de l'ombre (10%)
  },
};

/**
 * Type pour TypeScript (optionnel mais utile)
 */
export type ColorTheme = typeof colors;

