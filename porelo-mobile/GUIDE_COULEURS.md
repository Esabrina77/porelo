# 🎨 Guide de la Charte Graphique - PORELO Mobile

## Palette de Couleurs

Toutes les couleurs de l'application sont centralisées dans `src/theme/colors.ts`.

### Couleurs Principales

| Couleur | Code | Utilisation |
|---------|------|-------------|
| **Background** | `#F7F6CF` | Arrière-plan principal des écrans |
| **Primary Light** | `#B6D8F2` | Éléments interactifs, badges secondaires |
| **Accent** | `#F4CFDF` | Éléments d'accent, highlights |
| **Primary** | `#5784BA` | Boutons principaux, headers, prix |
| **Secondary** | `#9AC8EB` | Boutons secondaires, liens |

### Utilisation dans le Code

```tsx
import { colors } from '../theme/colors';

// Exemple d'utilisation
<View style={{ backgroundColor: colors.background }}>
  <TouchableOpacity style={{ backgroundColor: colors.primary }}>
    <Text style={{ color: colors.text.white }}>Bouton</Text>
  </TouchableOpacity>
</View>
```

## Logos

### Logo Complet (porelo.png)

- **Utilisation** : Écrans d'authentification, splash screen
- **Dimensions** : Grande taille pour les écrans d'accueil
- **Format** : PNG avec fond transparent

```tsx
<Logo size="large" variant="full" />
```

### Logo Icône (p_tronc.png)

- **Utilisation** : Icône d'application, headers compacts
- **Dimensions** : Petite taille pour les icônes
- **Format** : PNG avec fond transparent

```tsx
<Logo size="small" variant="icon" />
```

## Application des Couleurs

### Écrans d'Authentification
- **Background** : `#F7F6CF` (jaune/beige clair)
- **Boutons** : `#5784BA` (bleu foncé)
- **Liens** : `#9AC8EB` (bleu moyen)

### Écrans Produits
- **Background** : `#F7F6CF`
- **Cartes** : `#FFFFFF` (blanc)
- **Prix** : `#5784BA` (bleu foncé)
- **Stock disponible** : Fond vert clair
- **Rupture de stock** : Fond rose clair

### Headers de Navigation
- **Background** : `#5784BA` (bleu foncé)
- **Texte** : `#FFFFFF` (blanc)

## Modification des Couleurs

Pour changer les couleurs de l'application, modifiez uniquement le fichier `src/theme/colors.ts`.

Toutes les références aux couleurs sont centralisées, donc un changement dans ce fichier affectera toute l'application.

## Bonnes Pratiques

1. **Toujours utiliser `colors`** : Ne jamais écrire les couleurs en dur dans les composants
2. **Cohérence** : Utiliser les couleurs de la charte pour maintenir l'identité visuelle
3. **Contraste** : Vérifier que le texte reste lisible sur les fonds colorés
4. **Accessibilité** : S'assurer que les couleurs respectent les standards d'accessibilité

