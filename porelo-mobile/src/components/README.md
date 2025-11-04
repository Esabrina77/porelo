# Composants PORELO Mobile

Ce dossier contient les composants réutilisables de l'application.

## Logo

Composant pour afficher le logo PORELO avec différentes variantes.

### Utilisation

```tsx
import Logo from '../components/Logo';

// Logo complet, grande taille (pour écrans d'auth)
<Logo size="large" variant="full" />

// Logo icône, petite taille (pour headers)
<Logo size="small" variant="icon" />

// Avec styles personnalisés
<Logo 
  size="medium" 
  variant="full" 
  containerStyle={{ marginBottom: 20 }}
/>
```

### Props

- `size`: 'small' | 'medium' | 'large' - Taille du logo
- `variant`: 'full' | 'icon' - Logo complet ou icône tronquée
- `containerStyle`: Style personnalisé pour le conteneur
- `imageStyle`: Style personnalisé pour l'image

### Fichiers

- `porelo.png` - Logo complet "Porelo" écrit en entier
- `p_tronc.png` - Logo icône (P + plume) pour l'icône d'app

