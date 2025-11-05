# 🚀 Déploiement Quick Start - PORELO

## ✅ Configuration actuelle

- **Projet Expo** : `porelo`
- **ID Projet** : `89eb2f3b-fc30-4113-b726-f445353f791e`
- **Owner** : `kaporal`
- **EAS CLI** : Installé ✅
- **Connecté** : `kaporal` ✅

## 📱 Commande de build rapide

### Build Android (APK pour test)

```bash
cd porelo-mobile
eas build --platform android --profile preview
```

### Build Android (Production pour Play Store)

```bash
eas build --platform android --profile production
```

### Build iOS (si nécessaire)

```bash
eas build --platform ios --profile preview
```

## 📋 Prochaines étapes

1. **Lancer un build de test** :
   ```bash
   eas build --platform android --profile preview
   ```

2. **Suivre la progression** :
   - Le build prendra 10-15 minutes
   - Vous recevrez un lien de téléchargement dans le terminal
   - Un email de notification sera envoyé

3. **Installer l'APK** :
   - Téléchargez l'APK depuis le lien fourni
   - Installez-le sur votre téléphone Android
   - Testez l'application

4. **Voir vos builds** :
   ```bash
   eas build:list
   ```

## ⚙️ Configuration

Le fichier `eas.json` est déjà configuré avec :
- **preview** : Build APK pour test interne
- **production** : Build AAB pour Google Play Store
- **development** : Build avec development client

## 🔍 Vérifier l'état

```bash
# Voir qui est connecté
eas whoami

# Lister les builds
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]
```

## 📚 Documentation complète

Voir `GUIDE_DEPLOIEMENT.md` pour plus de détails.

