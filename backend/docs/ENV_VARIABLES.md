# 🔧 Variables d'environnement - Configuration

## 📋 Variables disponibles

### Variables obligatoires

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/porelo_db?schema=public"

# Secret pour signer les tokens JWT (minimum 32 caractères)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"

# Port du serveur HTTP
PORT=8080
```

### Variables optionnelles

```env
# Environnement (development, production, staging)
ENVIRONMENT=development

# Version de l'API
VERSION=1
```

### Variables OBLIGATOIRES pour la sécurité

```env
# Durée d'expiration de l'Access Token en minutes
# ⚠️ OBLIGATOIRE : L'application ne démarrera pas sans cette variable
ACCESS_TOKEN_EXPIRATION_MINUTES=15

# Durée d'expiration du Refresh Token en heures
# ⚠️ OBLIGATOIRE : L'application ne démarrera pas sans cette variable
REFRESH_TOKEN_EXPIRATION_HOURS=168
```

**⚠️ IMPORTANT :** Ces deux variables sont **OBLIGATOIRES** pour la sécurité. Si elles ne sont pas définies, l'application ne démarrera pas et affichera une erreur explicite.

## 🔐 Configuration des tokens

### Access Token (JWT)

**Variable :** `ACCESS_TOKEN_EXPIRATION_MINUTES`

**Valeurs recommandées :**
- **Développement** : `15` minutes (par défaut)
- **Production** : `15` à `60` minutes
- **Très sécurisé** : `5` à `10` minutes

**Exemple :**
```env
ACCESS_TOKEN_EXPIRATION_MINUTES=15
```

### Refresh Token

**Variable :** `REFRESH_TOKEN_EXPIRATION_HOURS`

**Valeurs recommandées :**
- **Développement** : `168` heures = 7 jours (par défaut)
- **Production** : `168` à `720` heures (7 à 30 jours)
- **Très sécurisé** : `24` à `72` heures (1 à 3 jours)

**Exemple :**
```env
REFRESH_TOKEN_EXPIRATION_HOURS=168
```

## 📝 Exemple de fichier .env complet

```env
# ============================================
# Configuration de base
# ============================================
PORT=8080
ENVIRONMENT=development
VERSION=1

# ============================================
# Base de données
# ============================================
DATABASE_URL="postgresql://porelo_user:Have2025porelo@localhost:5432/porelo_db?schema=public"

# ============================================
# Sécurité JWT
# ============================================
JWT_SECRET="azertg852azeAZERFC5478932AZEDJ"

# Durée de vie de l'Access Token (en minutes)
# Recommandé: 15 minutes pour développement, 15-60 pour production
ACCESS_TOKEN_EXPIRATION_MINUTES=15

# Durée de vie du Refresh Token (en heures)
# Recommandé: 168 heures (7 jours) pour développement, 168-720 (7-30 jours) pour production
REFRESH_TOKEN_EXPIRATION_HOURS=168
```

## ⚠️ Notes importantes

1. **JWT_SECRET** : Changez-le en production et utilisez un secret fort (minimum 32 caractères)
2. **Access Token** : Plus court = plus sécurisé mais plus de refresh nécessaires
3. **Refresh Token** : Plus long = meilleure UX mais moins sécurisé si volé
4. **Production** : Utilisez des valeurs plus courtes pour les deux tokens

## ⚠️ Sécurité obligatoire

**Les durées d'expiration sont OBLIGATOIRES** pour garantir la sécurité de l'application.

Si les variables `ACCESS_TOKEN_EXPIRATION_MINUTES` ou `REFRESH_TOKEN_EXPIRATION_HOURS` ne sont pas définies :

- ❌ **L'application ne démarrera pas**
- ❌ **Erreur explicite affichée** : "Configuration de sécurité manquante"
- ✅ **Forcer la configuration explicite** dans chaque environnement

Cette approche garantit que :
- ✅ Aucun token ne peut être créé sans expiration définie
- ✅ La configuration est explicite et documentée
- ✅ Pas de risque d'oublier de configurer les durées en production

