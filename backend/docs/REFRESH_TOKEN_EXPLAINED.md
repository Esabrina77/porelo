# 🔄 Refresh Token - Explication et Implémentation

## 📚 Qu'est-ce qu'un Refresh Token ?

### Problème actuel avec JWT simple

Actuellement, votre API utilise un **JWT simple** qui expire après **24 heures**. Cela pose plusieurs problèmes :

1. **Sécurité** : Si un token est volé, l'attaquant peut l'utiliser pendant 24h
2. **UX** : L'utilisateur doit se reconnecter tous les jours
3. **Flexibilité** : Impossible de révoquer un token sans changer le secret

### Solution : Access Token + Refresh Token

Le système de **Refresh Token** utilise **2 tokens** :

#### 1. **Access Token** (JWT court)
- ⏱️ **Durée de vie** : 15 minutes à 1 heure
- 🎯 **Usage** : Authentification des requêtes API
- 🔒 **Stockage** : Mémoire (localStorage/session)
- ⚠️ **Risque** : Si volé, durée limitée

#### 2. **Refresh Token** (Token long)
- ⏱️ **Durée de vie** : 7 à 30 jours
- 🎯 **Usage** : Obtenir un nouveau Access Token
- 🔒 **Stockage** : Base de données (révocable)
- ✅ **Sécurité** : Peut être révoqué instantanément

## 🔄 Comment ça fonctionne ?

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Login (email, password)
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 2. Retourne :
       │    - Access Token (15 min)
       │    - Refresh Token (7 jours)
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 3. Requête API avec Access Token
       ▼
┌─────────────┐
│   Backend   │ ✅ Accepte
└─────────────┘

... 15 minutes plus tard ...

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 4. Access Token expiré ❌
       ▼
┌─────────────┐
│   Backend   │ ❌ Rejette (401)
└──────┬──────┘
       │
       │ 5. Client utilise Refresh Token
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 6. Vérifie Refresh Token en DB
       │    Génère nouveau Access Token
       │    Retourne nouveau Access Token
       ▼
┌─────────────┐
│   Client    │ ✅ Nouveau Access Token
└─────────────┘
```

## 🎯 Avantages

1. **Sécurité renforcée** : Access Token court = moins de risque
2. **Révoquable** : Refresh Token stocké en DB = peut être supprimé
3. **Meilleure UX** : Utilisateur reste connecté 7 jours
4. **Rotation** : Nouveau Refresh Token à chaque refresh (bonne pratique)

## 📋 Implémentation dans PORELO

### Modèle de données

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userID    String
  user      User     @relation(fields: [userID], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  revoked   Boolean  @default(false)
  
  @@index([userID])
  @@index([token])
}
```

### Endpoints

1. **POST /auth/login** → Retourne `{ accessToken, refreshToken, user }`
2. **POST /auth/refresh** → Échange refreshToken contre nouveau accessToken
3. **POST /auth/logout** → Révoque le refreshToken
4. **POST /auth/logout-all** → Révoque tous les refreshTokens d'un utilisateur

### Flow côté client

```typescript
// 1. Login
const { accessToken, refreshToken } = await login(email, password);
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. Requête API avec Access Token
fetch('/api/products', {
  headers: { Authorization: `Bearer ${accessToken}` }
});

// 3. Si 401 (token expiré)
if (response.status === 401) {
  // Utiliser Refresh Token pour obtenir nouveau Access Token
  const newAccessToken = await refreshAccessToken(refreshToken);
  localStorage.setItem('accessToken', newAccessToken);
  // Réessayer la requête
}
```

## 🔐 Sécurité

- ✅ Refresh Token stocké en DB (révocable)
- ✅ Rotation : nouveau Refresh Token à chaque refresh
- ✅ Expiration automatique
- ✅ Suppression automatique des tokens expirés
- ✅ Logout révoque le token actuel
- ✅ Logout-all révoque tous les tokens de l'utilisateur

