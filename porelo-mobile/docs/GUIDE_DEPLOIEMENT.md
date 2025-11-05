# 🚀 Guide de Déploiement - PORELO Mobile

Ce guide vous accompagne pour déployer l'application PORELO sur Android et iOS via Expo Application Services (EAS).

## 📋 Prérequis

1. **Compte Expo** : Créez un compte sur [expo.dev](https://expo.dev)
2. **EAS CLI** : Installé globalement (`npm install -g eas-cli`)
3. **Configuration** : `app.json` configuré avec les bonnes informations

## 🔧 Étape 1 : Configuration initiale

### 1.1 Se connecter à Expo

```bash
cd porelo-mobile
eas login
```

### 1.2 Initialiser EAS dans le projet

```bash
eas init
```

Cela va :
- Créer un fichier `eas.json` avec la configuration des builds
- Lier votre projet à votre compte Expo

### 1.3 Configurer `eas.json`

Le fichier `eas.json` sera créé automatiquement. Vous pouvez le modifier selon vos besoins :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "bundleIdentifier": "com.porelo.mobile"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 📱 Étape 2 : Build Android

### 2.1 Build de test (APK)

```bash
eas build --platform android --profile preview
```

Cela va :
- Créer un APK que vous pouvez installer directement sur votre téléphone
- Générer un lien de téléchargement
- Prendre environ 10-15 minutes

### 2.2 Build de production (AAB)

```bash
eas build --platform android --profile production
```

Cela va :
- Créer un AAB (Android App Bundle) pour Google Play Store
- Prendre environ 15-20 minutes

### 2.3 Télécharger le build

Une fois le build terminé, vous recevrez :
- Un lien de téléchargement dans le terminal
- Un email de notification
- Un lien dans votre dashboard Expo

## 🍎 Étape 3 : Build iOS (Optionnel)

### 3.1 Prérequis iOS

- Compte développeur Apple (99$/an)
- Certificats Apple configurés

### 3.2 Build iOS

```bash
eas build --platform ios --profile preview
```

### 3.3 Build production iOS

```bash
eas build --platform ios --profile production
```

## 📦 Étape 4 : Soumettre aux stores

### 4.1 Google Play Store

```bash
eas submit --platform android
```

### 4.2 Apple App Store

```bash
eas submit --platform ios
```

## 🔍 Vérifier les builds

### Lister vos builds

```bash
eas build:list
```

### Voir les détails d'un build

```bash
eas build:view [BUILD_ID]
```

## ⚙️ Configuration avancée

### Variables d'environnement

Créer un fichier `.env` :

```bash
EXPO_PUBLIC_API_URL=https://votre-api.com
```

Puis dans `eas.json` :

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://votre-api.com"
      }
    }
  }
}
```

### Mise à jour OTA (Over-The-Air)

Pour mettre à jour l'app sans republier sur les stores :

```bash
eas update --branch production --message "Fix: Correction bugs"
```

## 🐛 Dépannage

### Erreur : "No credentials found"

```bash
eas credentials
```

### Erreur : "Build failed"

Vérifiez les logs :
```bash
eas build:view [BUILD_ID]
```

### Réinitialiser la configuration

```bash
eas build:configure
```

## 📚 Ressources

- [Documentation EAS](https://docs.expo.dev/build/introduction/)
- [Dashboard Expo](https://expo.dev)
- [Guide de soumission](https://docs.expo.dev/submit/introduction/)

## ⚠️ Notes importantes

1. **Premier build** : Peut prendre 15-20 minutes (téléchargement des dépendances)
2. **Builds suivants** : Plus rapides (cache utilisé)
3. **Coûts** : EAS Build est gratuit pour les projets publics, payant pour les projets privés
4. **Limites** : 30 builds/mois gratuits pour les comptes gratuits

## 🎯 Workflow recommandé

1. **Développement** : Utilisez `expo start` pour tester localement
2. **Test** : Utilisez `eas build --profile preview` pour créer un APK de test
3. **Production** : Utilisez `eas build --profile production` pour le store
4. **Mises à jour** : Utilisez `eas update` pour les mises à jour OTA

