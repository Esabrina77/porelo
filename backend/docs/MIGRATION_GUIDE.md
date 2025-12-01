# 🔄 Guide de Migration - Versioning, Rate Limiting et Refresh Token

## 📋 Résumé des changements

### 1. ✅ Versioning API (`/api/v1/`)

**Avant :**
```
POST /auth/login
GET /products
```

**Après :**
```
POST /api/v1/auth/login  ✅ Nouveau (recommandé)
POST /auth/login          ✅ Ancien (compatibilité)
```

**Impact :** Les anciennes routes fonctionnent toujours pour la compatibilité, mais les nouvelles routes sont disponibles sous `/api/v1/`.

### 2. ✅ Rate Limiting

**Configuration actuelle :**
- **100 requêtes par minute** par IP
- S'applique à toutes les routes
- Header de réponse : `Retry-After` en cas de dépassement

**Code HTTP :** `429 Too Many Requests`

### 3. ✅ Refresh Token System

**Changements dans les réponses :**

**Avant (Login/Register) :**
```json
{
  "token": "eyJhbGci...",
  "user": { ... }
}
```

**Après (Login/Register) :**
```json
{
  "accessToken": "eyJhbGci...",  // Durée : 15 minutes
  "refreshToken": "abc123...",    // Durée : 7 jours
  "user": { ... }
}
```

## 🔧 Migration du Frontend

### Étape 1 : Mettre à jour les types TypeScript

```typescript
// src/api/types/index.ts

export interface LoginResponse {
  accessToken: string;   // Au lieu de "token"
  refreshToken: string; // Nouveau
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string; // Nouveau refresh token (rotation)
}
```

### Étape 2 : Mettre à jour AuthContext

```typescript
// src/contexts/AuthContext.tsx

const handleLogin = async (email: string, password: string) => {
  const responseData = await loginUser(email, password);
  
  // Stocker les deux tokens
  localStorage.setItem('accessToken', responseData.accessToken);
  localStorage.setItem('refreshToken', responseData.refreshToken);
  localStorage.setItem('userInfo', JSON.stringify(responseData.user));
  
  setToken(responseData.accessToken);
  setUser(responseData.user);
};
```

### Étape 3 : Ajouter la logique de refresh automatique

```typescript
// src/api/apiClient.ts

async function handleResponse<T>(response: Response): Promise<T> {
  // Si 401 (token expiré), essayer de le rafraîchir
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        // Obtenir un nouveau access token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          
          // Réessayer la requête originale avec le nouveau token
          // (nécessite de stocker la requête originale)
        }
      } catch (err) {
        // Refresh échoué, déconnecter l'utilisateur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  }
  
  // ... reste du code
}
```

### Étape 4 : Mettre à jour les services API

```typescript
// src/api/services/authService.ts

export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return apiClient.post<RefreshTokenResponse>(
    '/auth/refresh',
    { refreshToken },
    false // Public endpoint
  );
}

export async function logout(refreshToken: string): Promise<void> {
  return apiClient.post<void>(
    '/auth/logout',
    { refreshToken },
    false // Public endpoint
  );
}
```

## 📝 Nouveaux endpoints

### POST `/auth/refresh`
Échange un refresh token contre un nouveau access token.

**Request :**
```json
{
  "refreshToken": "abc123..."
}
```

**Response :**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "xyz789..."  // Nouveau (rotation)
}
```

### POST `/auth/logout`
Révoque le refresh token actuel.

**Request :**
```json
{
  "refreshToken": "abc123..."
}
```

### POST `/auth/logout-all` (authentifié)
Révoque tous les refresh tokens de l'utilisateur connecté.

## 🚀 Prochaines étapes

1. **Exécuter la migration Prisma** pour créer la table `RefreshToken`
2. **Mettre à jour le frontend** pour utiliser les nouveaux tokens
3. **Tester** le système de refresh automatique
4. **Migrer progressivement** vers `/api/v1/` dans le frontend

