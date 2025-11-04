# 🚀 Guide de Démarrage - PORELO Mobile

## Comment tester l'application sur PC Windows ?

### Option 1 : Expo Go (recommandé pour débuter) ⭐

**Le plus simple** : Utiliser Expo Go sur votre téléphone Android/iOS.

#### Étapes :

1. **Installer Expo Go** sur votre téléphone :
   - Android : [Google Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS : [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

2. **Démarrer le serveur Expo** :
   ```bash
   cd porelo-mobile
   npm start
   ```
   Cela va afficher un QR code dans le terminal.

3. **Scanner le QR code** :
   - Android : Ouvrez Expo Go → "Scan QR code" → Scannez le QR code
   - iOS : Ouvrez l'appareil photo → Scannez le QR code → Ouvrir dans Expo Go

4. **C'est tout !** L'app se charge sur votre téléphone.

**Avantages** :
- ✅ Pas besoin d'émulateur
- ✅ Test sur un vrai appareil
- ✅ Rapide à configurer

**Inconvénients** :
- ⚠️ Nécessite que votre téléphone et PC soient sur le même WiFi
- ⚠️ Quelques limitations (pas toutes les fonctionnalités natives)

---

### Option 2 : Émulateur Android (plus de fonctionnalités)

#### Prérequis :

1. **Installer Android Studio** :
   - Téléchargez depuis : https://developer.android.com/studio
   - Installez-le avec tous les composants (SDK, outils, etc.)

2. **Configurer un appareil virtuel (AVD)** :
   - Ouvrez Android Studio
   - Menu : Tools → Device Manager
   - Cliquez "Create Device"
   - Choisissez un appareil (ex: Pixel 5)
   - Choisissez une version Android (ex: Android 13)
   - Cliquez "Finish"

3. **Démarrer l'émulateur** :
   - Dans Device Manager, cliquez "Play" ▶️ sur votre appareil virtuel
   - L'émulateur va démarrer (peut prendre quelques minutes la première fois)

4. **Démarrer l'app** :
   ```bash
   cd porelo-mobile
   npm run android
   ```
   L'app va se compiler et s'ouvrir automatiquement dans l'émulateur.

**Avantages** :
- ✅ Plus de fonctionnalités natives
- ✅ Test rapide sans téléphone
- ✅ Simule différents appareils

**Inconvénients** :
- ⚠️ Nécessite beaucoup d'espace disque (plusieurs GB)
- ⚠️ Peut être lent selon votre PC
- ⚠️ Configuration initiale plus longue

---

### Option 3 : Navigateur Web (limité) 🌐

Pour tester rapidement l'interface (mais avec limitations) :

```bash
cd porelo-mobile
npm run web
```

**Avantages** :
- ✅ Démarrage rapide
- ✅ Pas d'installation supplémentaire

**Inconvénients** :
- ⚠️ Beaucoup de fonctionnalités natives ne fonctionnent pas
- ⚠️ Pas représentatif de l'expérience mobile réelle

---

## 📋 Comparaison des Options

| Méthode | Simplicité | Fonctionnalités | Temps de Setup |
|---------|-----------|-----------------|---------------|
| **Expo Go (Téléphone)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 5 minutes |
| **Émulateur Android** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 30-60 minutes |
| **Navigateur Web** | ⭐⭐⭐⭐⭐ | ⭐⭐ | 1 minute |

## 🎯 Recommandation

**Pour commencer** : Utilisez **Expo Go sur votre téléphone** (Option 1)
- C'est le plus rapide
- Vous testez sur un vrai appareil
- Parfait pour le développement initial

**Plus tard** : Installez **Android Studio + Émulateur** (Option 2)
- Quand vous voulez tester des fonctionnalités natives avancées
- Pour tester sur différentes tailles d'écran

## 🔧 Configuration pour Expo Go

### URL de l'API Backend

Si vous utilisez Expo Go sur votre téléphone :

1. **Vérifiez que votre PC et téléphone sont sur le même WiFi**

2. **Trouvez l'IP de votre PC** :
   ```bash
   # Windows PowerShell
   ipconfig
   # Cherchez "IPv4" - exemple: 192.168.1.100
   ```

3. **Modifiez `src/services/api.ts`** :
   ```typescript
   const BASE_URL = 'http://192.168.1.100:8080'; // Remplacez par votre IP
   ```

4. **Vérifiez que le backend est démarré** :
   ```bash
   cd backend
   go run main.go
   ```

5. **Vérifiez que le firewall autorise le port 8080**

## 🐛 Problèmes Courants

### "Unable to connect to Metro"
- Vérifiez que `npm start` est bien lancé
- Vérifiez que votre téléphone et PC sont sur le même WiFi
- Essayez de redémarrer Expo : appuyez sur `r` dans le terminal où `npm start` tourne

### "Network request failed" dans l'app
- Vérifiez l'URL dans `src/services/api.ts`
- Vérifiez que le backend tourne sur `http://localhost:8080`
- Pour téléphone physique : utilisez l'IP de votre PC, pas `localhost`

### L'émulateur ne démarre pas
- Vérifiez que Virtualization est activé dans le BIOS
- Vérifiez que Hyper-V est désactivé (Windows)
- Augmentez la RAM allouée à l'émulateur dans Android Studio

## 📱 Commandes Utiles

```bash
# Démarrer Expo (affiche QR code)
npm start

# Démarrer sur Android (nécessite émulateur)
npm run android

# Démarrer sur iOS (nécessite macOS)
npm run ios

# Démarrer dans le navigateur
npm run web

# Nettoyer le cache
npm start -- --clear
```

## ✅ Checklist de Démarrage

- [ ] Expo Go installé sur téléphone (Option 1) OU Android Studio installé (Option 2)
- [ ] Backend démarré (`go run main.go` dans `backend/`)
- [ ] URL de l'API configurée dans `src/services/api.ts`
- [ ] PC et téléphone sur le même WiFi (si Option 1)
- [ ] Firewall autorise le port 8080
- [ ] `npm start` lancé dans `porelo-mobile/`

Bon test ! 🎉

