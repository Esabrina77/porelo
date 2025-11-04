# 📱 Guide Complet - Application React Native PORELO

Ce guide vous aidera à comprendre et à continuer le développement de l'application mobile PORELO.

## 📂 Structure du Projet

```
porelo-mobile/
├── src/
│   ├── components/         # Composants réutilisables
│   │   └── Logo.tsx        # Composant logo PORELO
│   ├── contexts/           # Contextes React (état global)
│   │   └── AuthContext.tsx # Gestion de l'authentification
│   ├── navigation/         # Configuration de la navigation
│   │   ├── AppNavigator.tsx # Navigation principale
│   │   └── types.ts        # Types TypeScript pour la navigation
│   ├── screens/            # Écrans de l'application
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   └── ProductDetailScreen.tsx
│   ├── services/           # Services API
│   │   └── api.ts          # Client HTTP avec gestion JWT
│   ├── theme/              # Thème et couleurs
│   │   └── colors.ts       # Charte de couleurs PORELO
│   └── types/              # Types TypeScript
│       └── index.ts        # Tous les types de l'app
├── assets/
│   └── logo/
│       ├── porelo.png      # Logo complet
│       └── p_tronc.png     # Logo icône (P + plume)
├── App.tsx                 # Point d'entrée principal
├── app.json                # Configuration Expo (icône, splash)
└── package.json            # Dépendances
```

## 🎨 Charte de Couleurs

Toutes les couleurs sont définies dans `src/theme/colors.ts` :

- **#F7F6CF** - Background (jaune/beige clair)
- **#B6D8F2** - Primary Light (bleu clair)
- **#F4CFDF** - Accent (rose clair)
- **#5784BA** - Primary (bleu foncé) - Boutons principaux
- **#9AC8EB** - Secondary (bleu moyen) - Boutons secondaires

**Important** : Utilisez toujours `colors` depuis `src/theme/colors.ts` au lieu de codes couleurs en dur.

## 🔐 Authentification

### Comment ça marche ?

1. **Login/Register** : L'utilisateur saisit email/password
2. **Token JWT** : Le backend retourne un token qui est stocké dans AsyncStorage
3. **Requêtes automatiques** : Le token est ajouté automatiquement à toutes les requêtes API
4. **Vérification au démarrage** : L'app vérifie si un token existe au démarrage
5. **Navigation conditionnelle** : Si pas de token → écran Login, sinon → écran Produits

### Utilisation du contexte

```tsx
import { useAuth } from '../contexts/AuthContext';

const { user, login, logout, isAuthenticated } = useAuth();
```

## 🌐 Communication avec l'API

### Configuration

Modifiez `src/services/api.ts` pour changer l'URL du backend :

```typescript
const BASE_URL = 'http://10.0.2.2:8080'; // Android Emulator
// ou 'http://localhost:8080' pour iOS
// ou 'http://192.168.1.100:8080' pour appareil physique
```

### Services disponibles

- `authService` : login, register, logout, getCurrentUser
- `productService` : getAll, getById, create, update, delete
- `orderService` : create, getMyOrders, getById

### Gestion automatique du token

Le token JWT est :
- Stocké automatiquement après login/register
- Ajouté automatiquement dans le header `Authorization` de chaque requête
- Supprimé automatiquement si erreur 401 (token invalide)

## 📱 Navigation

### Structure

- **Écrans d'auth** (non connecté) : Login → Register
- **Écrans principaux** (connecté) : Products → ProductDetail

### Ajouter un nouvel écran

1. Créer l'écran dans `src/screens/MonEcran.tsx`
2. Ajouter le type dans `src/navigation/types.ts` :
   ```typescript
   export type RootStackParamList = {
     // ... autres écrans
     MonEcran: { param1: string }; // Si l'écran nécessite des paramètres
   };
   ```
3. Enregistrer dans `src/navigation/AppNavigator.tsx` :
   ```typescript
   <Stack.Screen
     name="MonEcran"
     component={MonEcran}
     options={{ title: 'Mon Écran' }}
   />
   ```
4. Naviguer depuis un autre écran :
   ```typescript
   navigation.navigate('MonEcran', { param1: 'valeur' });
   ```

## 🖼️ Logos

### Composant Logo

```tsx
import Logo from '../components/Logo';

// Logo complet, grande taille (écrans d'auth)
<Logo size="large" variant="full" />

// Logo icône, petite taille (headers)
<Logo size="small" variant="icon" />
```

### Fichiers

- `assets/logo/porelo.png` : Logo complet "Porelo"
- `assets/logo/p_tronc.png` : Logo icône (P + plume)

L'icône de l'app est configurée dans `app.json` pour utiliser `p_tronc.png`.

## 🚀 Commandes Utiles

### Démarrer l'application

```bash
# Android
npm run android

# iOS (nécessite macOS)
npm run ios

# Web (développement)
npm run web
```

### Installer une nouvelle dépendance

```bash
npm install nom-du-package
```

### Regénérer les types TypeScript

Les types sont définis manuellement dans `src/types/`. Si l'API change, mettez à jour ces types.

## 🐛 Dépannage

### Erreur : "Network request failed"

1. Vérifiez que le backend est démarré
2. Vérifiez l'URL dans `src/services/api.ts`
3. Pour appareil physique : utilisez l'IP de votre machine, pas `localhost`
4. Vérifiez que CORS est configuré dans le backend

### Erreur : "Token invalid" (401)

- Le token a expiré (24h)
- Déconnectez-vous et reconnectez-vous
- Le token est automatiquement supprimé en cas d'erreur 401

### Erreur de navigation

- Vérifiez que l'écran est bien enregistré dans `AppNavigator.tsx`
- Vérifiez que le type est défini dans `types.ts`
- Vérifiez les paramètres passés lors de la navigation

## 📝 Ajouter une Fonctionnalité

### Exemple : Ajouter un écran "Mon Profil"

1. **Créer l'écran** `src/screens/ProfileScreen.tsx` :
   ```tsx
   import React from 'react';
   import { View, Text } from 'react-native';
   import { useAuth } from '../contexts/AuthContext';
   import { colors } from '../theme/colors';
   
   export default function ProfileScreen() {
     const { user } = useAuth();
     
     return (
       <View style={{ flex: 1, backgroundColor: colors.background }}>
         <Text>Email: {user?.email}</Text>
         <Text>Rôle: {user?.role}</Text>
       </View>
     );
   }
   ```

2. **Ajouter dans `types.ts`** :
   ```typescript
   Profile: undefined,
   ```

3. **Ajouter dans `AppNavigator.tsx`** :
   ```typescript
   <Stack.Screen
     name="Profile"
     component={ProfileScreen}
     options={{ title: 'Mon Profil' }}
   />
   ```

4. **Naviguer** :
   ```tsx
   navigation.navigate('Profile');
   ```

## 🔄 Cycle de Vie d'une Requête API

1. **Utilisateur actionne** (ex: clic sur "Se connecter")
2. **Écran appelle** `authService.login(data)`
3. **Service API** fait la requête HTTP avec Axios
4. **Intercepteur** ajoute automatiquement le token (si disponible)
5. **Backend répond** avec les données
6. **Service retourne** les données au composant
7. **Composant met à jour** l'état local ou le contexte

## 📚 Ressources

- **React Navigation** : https://reactnavigation.org/
- **Expo** : https://docs.expo.dev/
- **React Native** : https://reactnative.dev/
- **TypeScript** : https://www.typescriptlang.org/

## 💡 Conseils pour Continuer

1. **Lisez les commentaires** : Chaque fichier est bien commenté pour vous guider
2. **Centralisez les couleurs** : Utilisez toujours `colors` depuis `theme/colors.ts`
3. **Typez tout** : TypeScript vous aidera à éviter les erreurs
4. **Réutilisez les composants** : Créez des composants réutilisables dans `components/`
5. **Testez régulièrement** : Testez sur un appareil/émulateur régulièrement

Bon développement ! 🚀

