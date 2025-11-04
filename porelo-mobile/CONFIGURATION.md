# 🔧 Guide de Configuration - PORELO Mobile

## ⚙️ Configuration de l'URL de l'API

### Où modifier l'URL ?

Ouvrez le fichier : **`src/services/api.ts`**

Cherchez la ligne :
```typescript
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080' // Android Emulator
  : 'https://votre-api-production.com';
```

### URLs selon votre environnement

#### Pour Android Emulator
```typescript
const BASE_URL = 'http://10.0.2.2:8080';
```
- `10.0.2.2` est l'adresse IP spéciale qui pointe vers `localhost` de votre machine dans l'émulateur Android

#### Pour iOS Simulator
```typescript
const BASE_URL = 'http://localhost:8080';
```
- iOS Simulator partage le réseau avec votre Mac, donc `localhost` fonctionne

#### Pour appareil physique (Android/iOS)
```typescript
const BASE_URL = 'http://192.168.1.100:8080'; // Remplacez par l'IP de votre machine
```
- Vous devez utiliser l'IP locale de votre machine sur le réseau WiFi
- Pour trouver votre IP :
  - **Windows** : `ipconfig` (cherchez "IPv4")
  - **Mac/Linux** : `ifconfig` ou `ip addr`
- Important : L'appareil et votre machine doivent être sur le même réseau WiFi

#### Pour production
```typescript
const BASE_URL = 'https://api.votre-domaine.com';
```

## 🔐 Configuration CORS du Backend

Assurez-vous que votre backend autorise les requêtes depuis votre application mobile.

Dans `backend/main.go`, vérifiez que CORS est configuré :

```go
r.Use(cors.Handler(cors.Options{
    AllowedOrigins: []string{
        "*", // Pour le développement mobile, vous pouvez autoriser toutes les origines
        // Ou spécifiquement votre IP : "http://192.168.1.100:8080"
    },
    // ... autres options
}))
```

**Note pour production** : Ne jamais utiliser `"*"` en production ! Spécifiez votre domaine exact.

## 🧪 Tester la connexion

### Vérifier que le backend fonctionne

1. Démarrez votre backend :
   ```bash
   cd backend
   go run main.go
   ```

2. Vérifiez que l'API répond :
   - Depuis un navigateur : `http://localhost:8080/swagger`
   - Ou avec curl : `curl http://localhost:8080/auth/login`

### Vérifier depuis l'app mobile

1. Démarrez l'application :
   ```bash
   npm run android  # ou npm run ios
   ```

2. Essayez de vous connecter avec :
   - Email : `momo@ynov.com`
   - Password : `Password2025`

3. Si vous voyez une erreur réseau :
   - Vérifiez l'URL dans `api.ts`
   - Vérifiez que le backend est démarré
   - Vérifiez que CORS est configuré
   - Pour appareil physique : vérifiez l'IP et le réseau WiFi

## 🐛 Dépannage

### Erreur : "Network request failed"
- Backend non démarré → Démarrez le backend
- Mauvaise URL → Vérifiez `BASE_URL` dans `api.ts`
- Firewall → Autorisez le port 8080

### Erreur : "CORS policy"
- CORS non configuré → Ajoutez le middleware CORS dans `backend/main.go`
- Origine non autorisée → Ajoutez votre IP/origine dans `AllowedOrigins`

### Token expiré (erreur 401)
- Déconnectez-vous et reconnectez-vous
- Le token JWT expire après 24h (configuré dans le backend)

## 📝 Notes importantes

- **Android Emulator** : Utilisez toujours `10.0.2.2` au lieu de `localhost`
- **Appareil physique** : Assurez-vous que l'appareil et votre machine sont sur le même WiFi
- **Production** : Changez l'URL pour pointer vers votre API de production

