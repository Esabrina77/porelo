/**
 * TYPOGRAPHIE - PORELO
 * 
 * Polices douces et élégantes inspirées du logo
 * - Playfair Display : titres et éléments importants (style calligraphique)
 * - Quicksand : texte courant (arrondi, doux, lisible)
 */

export const typography = {
  /**
   * Titres principaux - Playfair Display (élégant, calligraphique)
   */
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  
  /**
   * Sous-titres - Playfair Display (légèrement plus petit)
   */
  subtitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  
  /**
   * Titres de section - Quicksand (moyen, arrondi)
   */
  sectionTitle: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  
  /**
   * Texte courant - Quicksand (régulier, doux)
   */
  body: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  /**
   * Texte secondaire - Quicksand (légèrement plus petit)
   */
  bodySmall: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  /**
   * Labels et boutons - Quicksand (moyen)
   */
  label: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  
  /**
   * Boutons - Quicksand (semi-bold)
   */
  button: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  
  /**
   * Prix - Quicksand (bold, pour mettre en valeur)
   */
  price: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  
  /**
   * Badges et petites étiquettes - Quicksand (medium)
   */
  badge: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
};

/**
 * Type pour TypeScript
 */
export type TypographyTheme = typeof typography;

