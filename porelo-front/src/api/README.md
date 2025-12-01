# 📡 API Services - Documentation

Cette documentation décrit la structure et l'utilisation des services API TypeScript pour communiquer avec le backend PORELO.

## 📁 Structure

```
src/api/
├── types/
│   └── index.ts          # Tous les types TypeScript (User, Product, Order, etc.)
├── services/
│   ├── authService.ts    # Authentification (login, register)
│   ├── productService.ts # Produits (CRUD, recherche)
│   ├── orderService.ts   # Commandes (création, liste)
│   ├── categoryService.ts # Catégories (CRUD)
│   ├── reviewService.ts  # Avis (création, liste)
│   └── index.ts          # Export centralisé
├── apiClient.ts          # Client HTTP centralisé avec gestion du token
└── index.ts              # Export principal de l'API
```

## 🚀 Utilisation

### Import des services

```typescript
// Import d'un service spécifique
import { loginUser, registerUser } from '@/api/services/authService';
import { fetchProducts } from '@/api/services/productService';

// Import des types
import { Product, User, Order } from '@/api/types';

// Import depuis l'export centralisé
import { authService, productService } from '@/api/services';
```

### Authentification

```typescript
import { loginUser, registerUser } from '@/api/services/authService';
import { LoginResponse } from '@/api/types';

// Connexion
try {
  const response: LoginResponse = await loginUser('user@example.com', 'password123');
  // response.token contient le JWT
  // response.user contient les infos utilisateur
  localStorage.setItem('userToken', response.token);
} catch (error) {
  console.error('Erreur de connexion:', error.message);
}

// Inscription
try {
  const response = await registerUser('user@example.com', 'password123');
  // Même structure que login
} catch (error) {
  console.error('Erreur d\'inscription:', error.message);
}
```

### Produits

```typescript
import { fetchProducts, getProductById } from '@/api/services/productService';
import { PaginatedProductsResponse, Product } from '@/api/types';

// Liste paginée des produits
const data: PaginatedProductsResponse = await fetchProducts(1, 20);
console.log(data.products); // Tableau de produits
console.log(data.totalPages); // Nombre total de pages

// Détails d'un produit
const product: Product = await getProductById('product-id');
```

### Commandes

```typescript
import { createOrder, getUserOrders } from '@/api/services/orderService';
import { CreateOrderRequest, Order } from '@/api/types';

// Créer une commande
const orderRequest: CreateOrderRequest = {
  items: [
    { productID: 'product-id-1', quantity: 2 },
    { productID: 'product-id-2', quantity: 1 }
  ]
};
const order: Order = await createOrder(orderRequest);

// Liste des commandes de l'utilisateur
const orders: Order[] = await getUserOrders();
```

### Catégories

```typescript
import { getAllCategories } from '@/api/services/categoryService';
import { Category } from '@/api/types';

// Liste de toutes les catégories (endpoint public)
const categories: Category[] = await getAllCategories();
```

### Avis

```typescript
import { createReview, getProductReviews } from '@/api/services/reviewService';
import { CreateReviewRequest, ProductReviewsResponse } from '@/api/types';

// Créer un avis
const reviewRequest: CreateReviewRequest = {
  productID: 'product-id',
  rating: 5,
  comment: 'Excellent produit !'
};
const review = await createReview(reviewRequest);

// Avis d'un produit avec statistiques
const reviews: ProductReviewsResponse = await getProductReviews('product-id');
console.log(reviews.averageRating); // Note moyenne
console.log(reviews.totalReviews); // Nombre total d'avis
```

## 🔐 Gestion de l'authentification

Le client API (`apiClient.ts`) gère automatiquement :

- ✅ Ajout du token JWT dans les headers (`Authorization: Bearer <token>`)
- ✅ Récupération du token depuis `localStorage`
- ✅ Gestion des erreurs 401 (session expirée)
- ✅ Nettoyage automatique du token invalide

### Endpoints publics vs privés

Certains endpoints sont publics (ne nécessitent pas d'authentification) :

```typescript
// Public (requiresAuth = false)
await apiClient.get<Category[]>('/categories', false);

// Privé (requiresAuth = true par défaut)
await apiClient.get<Product[]>('/products');
```

## 🎯 Utilisation avec AuthContext

Le `AuthContext` utilise déjà ces services :

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { login, register, logout, user, isAuthenticated } = useAuth();
  
  // Le contexte gère déjà le stockage du token
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Redirection automatique après connexion
    } catch (error) {
      // Gestion de l'erreur
    }
  };
}
```

## 📝 Types disponibles

Tous les types sont définis dans `src/api/types/index.ts` :

- `User`, `UserRequest`, `LoginRequest`, `LoginResponse`
- `Product`, `ProductRequest`, `PatchProductRequest`, `PaginatedProductsResponse`
- `Order`, `OrderItem`, `CreateOrderRequest`, `UpdateOrderStatusRequest`
- `Category`, `CategoryRequest`, `PatchCategoryRequest`
- `Review`, `CreateReviewRequest`, `UpdateReviewRequest`, `ProductReviewsResponse`
- `ApiError`

## ⚙️ Configuration

L'URL de l'API est configurée via la variable d'environnement :

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Par défaut, si non définie, l'URL est `http://localhost:8080`.

## 🐛 Gestion des erreurs

Toutes les erreurs sont typées avec `ApiError` :

```typescript
try {
  await fetchProducts();
} catch (error: ApiError) {
  console.error(error.message); // Message d'erreur
  console.error(error.statusCode); // Code HTTP (401, 403, 500, etc.)
  
  if (error.statusCode === 401) {
    // Session expirée - rediriger vers login
  }
}
```

## ✅ Bonnes pratiques

1. **Toujours utiliser les types TypeScript** pour bénéficier de l'autocomplétion
2. **Gérer les erreurs** avec try/catch
3. **Utiliser AuthContext** pour l'authentification plutôt que d'appeler directement les services
4. **Vérifier l'authentification** avant d'appeler les endpoints privés
5. **Utiliser les types importés** plutôt que de redéfinir les interfaces

