# PORELO Mobile - Application React Native

Application mobile React Native (Expo) pour la boutique de produits de soins PORELO.

## 📱 Technologies

- **React Native** (via Expo) - Framework mobile
- **TypeScript** - Typage statique
- **React Navigation** - Navigation entre écrans
- **Axios** - Client HTTP pour l'API
- **AsyncStorage** - Stockage local (token JWT)
- **Context API** - Gestion de l'état d'authentification

## 🚀 Démarrage rapide

### Option 1 : Expo Go sur votre téléphone (recommandé) ⭐

1. **Installer Expo Go** sur votre téléphone :
   - Android : [Télécharger sur Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS : [Télécharger sur App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Démarrer Expo** :
   ```bash
   npm start
   ```
   Un QR code s'affiche dans le terminal.

4. **Scanner le QR code** avec Expo Go (Android) ou l'appareil photo (iOS)

5. **C'est tout !** L'application se charge sur votre téléphone.

> ⚠️ Important : Votre téléphone et votre PC doivent être sur le même réseau WiFi.

### Option 2 : Émulateur Android

1. **Installer Android Studio** : https://developer.android.com/studio
2. **Créer un appareil virtuel** dans Android Studio
3. **Démarrer l'émulateur**
4. **Lancer l'app** :
   ```bash
   npm run android
   ```

### Option 3 : Navigateur Web (limité)

```bash
npm run web
```

> 📖 Pour plus de détails, consultez [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md)

## 📂 Structure du projet

```
porelo-mobile/
├── src/
│   ├── contexts/          # Contextes React (AuthContext)
│   ├── navigation/        # Configuration de la navigation
│   ├── screens/           # Écrans de l'application
│   ├── services/          # Services API (communication avec le backend)
│   └── types/             # Types TypeScript
├── App.tsx                # Point d'entrée principal
└── package.json
```

## 🔧 Configuration

### URL de l'API Backend

Modifiez `src/services/api.ts` pour configurer l'URL de votre backend :

```typescript
// Pour Android Emulator
const BASE_URL = 'http://10.0.2.2:8080';

// Pour iOS Simulator
const BASE_URL = 'http://localhost:8080';

// Pour appareil physique
const BASE_URL = 'http://192.168.1.100:8080'; // IP de votre machine
```

## 📱 Écrans disponibles

### Authentification
- **Login** - Connexion avec email/mot de passe
- **Register** - Création de compte

### Produits
- **Products** - Liste de tous les produits
- **ProductDetail** - Détails d'un produit

## 🔐 Authentification

L'application utilise JWT pour l'authentification :
1. L'utilisateur se connecte avec email/password
2. Le token JWT est stocké dans AsyncStorage
3. Le token est automatiquement ajouté aux requêtes API
4. Si le token expire (401), l'utilisateur est déconnecté

## 📝 Notes importantes

- Le token JWT est stocké localement sur l'appareil
- Les requêtes API incluent automatiquement le token
- L'état d'authentification est géré globalement via Context API
- La navigation est conditionnelle (login si non connecté, app si connecté)

## 🐛 Dépannage

### Erreur CORS
Assurez-vous que votre backend a CORS configuré pour accepter les requêtes depuis l'appareil/émulateur.

### Impossible de se connecter au backend
- Vérifiez que le backend est démarré
- Vérifiez l'URL dans `api.ts` (différente selon Android/iOS/physique)
- Pour appareil physique : utilisez l'IP de votre machine, pas `localhost`

### Token invalide
Si vous voyez des erreurs 401, le token est probablement expiré. Déconnectez-vous et reconnectez-vous.

