# Guide des Commits - API Skincare Shop

Voici l'ordre recommandé des commits pour un développement progressif et logique.

## Commit 1: Mise à jour du schéma Prisma - Ajout des modèles Category, Order, OrderItem
```bash
git add backend/prisma/schema.prisma
git commit -m "feat(prisma): add Category, Order and OrderItem models for skincare shop

- Add Category model with unique name
- Add Product model with optional category relation and imageURL
- Add Order model with status enum (PENDING, SHIPPED, DELIVERED, CANCELLED)
- Add OrderItem model to link products to orders
- Update User model to include orders relation
- Remove deprecated Author relation from Product"
```

## Commit 2: Migration Prisma
```bash
git add backend/prisma/migrations/
git commit -m "chore(prisma): run migration for new models"
```

## Commit 3: DTOs pour l'authentification
```bash
git add backend/internal/dtos/user_dto.go
git commit -m "feat(dtos): add user authentication DTOs

- Add UserRequest for registration/update
- Add UserResponse without password field
- Add LoginRequest and LoginResponse DTOs"
```

## Commit 4: Utilitaires JWT
```bash
git add backend/internal/utils/jwt.go backend/internal/utils/user.go
git commit -m "feat(auth): implement JWT token generation and validation

- Add GenerateToken function with user claims (userID, email, role)
- Add ValidateToken function with error handling
- Add JWTClaims struct with registered claims
- Add RespondError utility function for error responses
- Token expiration set to 24 hours"
```

## Commit 5: Middleware d'authentification
```bash
git add backend/internal/middlewares/auth_middleware.go
git commit -m "feat(middleware): add JWT authentication middleware

- Validate Bearer token from Authorization header
- Extract and validate JWT claims
- Store user claims in request context
- Return 401 for invalid/missing tokens"
```

## Commit 6: Middleware de rôles
```bash
git add backend/internal/middlewares/role_middleware.go
git commit -m "feat(middleware): add role-based authorization middleware

- Add RequireRole middleware for role checking
- Extract user claims from context
- Validate user role against required role
- Return 403 for unauthorized access"
```

## Commit 7: Service d'authentification
```bash
git add backend/internal/services/auth_service.go
git commit -m "feat(auth): implement authentication service

- Add Register function to create new users with JWT
- Add Login function to authenticate users and return JWT
- Add GetCurrentUser function to fetch user data
- Handle password hashing and validation"
```

## Commit 8: Handlers d'authentification
```bash
git add backend/internal/handlers/auth.go
git commit -m "feat(auth): add authentication HTTP handlers

- Add RegisterHandler for user registration
- Add LoginHandler for user login
- Add MeHandler to get current user info
- Include request validation and error handling"
```

## Commit 9: Routes d'authentification
```bash
git add backend/internal/routes/auth.go
git add backend/main.go
git commit -m "feat(routes): add authentication routes

- Add POST /auth/register (public)
- Add POST /auth/login (public)
- Add GET /auth/me (protected)
- Register auth routes in main router"
```

## Commit 10: DTOs pour les produits
```bash
git add backend/internal/dtos/product_dto.go
git commit -m "feat(dtos): add product DTOs

- Add ProductRequest for create/update operations
- Add ProductResponse with optional category relation
- Include all product fields (name, description, price, stock, imageURL)"
```

## Commit 11: Service des produits
```bash
git add backend/internal/services/product_service.go
git commit -m "feat(products): implement product service

- Add GetAllProducts to fetch all products with categories
- Add GetProductByID to fetch single product
- Add CreateProduct with validation and category linking
- Add UpdateProduct with stock and category management
- Add DeleteProduct function
- Handle optional fields (description, imageURL, category)"
```

## Commit 12: Handlers des produits
```bash
git add backend/internal/handlers/product.go
git commit -m "feat(products): add product HTTP handlers

- Add GetAllProductsHandler (public)
- Add GetProductHandler (public)
- Add CreateProductHandler (admin only)
- Add UpdateProductHandler (admin only)
- Add DeleteProductHandler (admin only)
- Include validation for price, stock, and name"
```

## Commit 13: Routes des produits
```bash
git add backend/internal/routes/product.go
git add backend/main.go
git commit -m "feat(routes): add product routes with role-based access

- Add GET /products (public)
- Add GET /products/{id} (public)
- Add POST /admin/products (admin only)
- Add PUT /admin/products/{id} (admin only)
- Add DELETE /admin/products/{id} (admin only)"
```

## Commit 14: DTOs pour les catégories
```bash
git add backend/internal/dtos/category_dto.go
git commit -m "feat(dtos): add category DTOs

- Add CategoryRequest for create/update
- Add CategoryResponse with timestamps"
```

## Commit 15: Service des catégories
```bash
git add backend/internal/services/category_service.go
git commit -m "feat(categories): implement category service

- Add GetAllCategories to fetch all categories
- Add GetCategoryByID to fetch single category
- Add CreateCategory with duplicate name validation
- Add UpdateCategory with validation
- Add DeleteCategory function"
```

## Commit 16: Handlers des catégories
```bash
git add backend/internal/handlers/category.go
git commit -m "feat(categories): add category HTTP handlers

- Add GetAllCategoriesHandler (admin only)
- Add GetCategoryHandler (admin only)
- Add CreateCategoryHandler (admin only)
- Add UpdateCategoryHandler (admin only)
- Add DeleteCategoryHandler (admin only)"
```

## Commit 17: Routes des catégories
```bash
git add backend/internal/routes/category.go
git add backend/main.go
git commit -m "feat(routes): add category admin routes

- Add GET /admin/categories (admin only)
- Add GET /admin/categories/{id} (admin only)
- Add POST /admin/categories (admin only)
- Add PUT /admin/categories/{id} (admin only)
- Add DELETE /admin/categories/{id} (admin only)"
```

## Commit 18: DTOs pour les commandes
```bash
git add backend/internal/dtos/order_dto.go
git commit -m "feat(dtos): add order DTOs

- Add OrderItemRequest for order creation
- Add CreateOrderRequest with items array
- Add OrderItemResponse with product details
- Add OrderResponse with full order information
- Add UpdateOrderStatusRequest for status updates"
```

## Commit 19: Service des commandes
```bash
git add backend/internal/services/order_service.go
git commit -m "feat(orders): implement order service

- Add CreateOrder with stock validation and automatic deduction
- Add GetAllOrders for admin to fetch all orders
- Add GetUserOrders to fetch user's own orders
- Add GetOrderByID with access control (own order or admin)
- Add UpdateOrderStatus for admin to change order status
- Handle order items and product price snapshot"
```

## Commit 20: Handlers des commandes
```bash
git add backend/internal/handlers/order.go
git commit -m "feat(orders): add order HTTP handlers

- Add CreateOrderHandler (authenticated users)
- Add GetUserOrdersHandler (authenticated users)
- Add GetAllOrdersHandler (admin only)
- Add GetOrderHandler with access control
- Add UpdateOrderStatusHandler (admin only)
- Include status validation (PENDING, SHIPPED, DELIVERED, CANCELLED)"
```

## Commit 21: Routes des commandes
```bash
git add backend/internal/routes/order.go
git add backend/main.go
git commit -m "feat(routes): add order routes with role-based access

- Add POST /orders (authenticated users)
- Add GET /orders (authenticated users - own orders)
- Add GET /orders/{id} (authenticated users - own or admin)
- Add GET /admin/orders (admin only)
- Add PUT /admin/orders/{id}/status (admin only)"
```

## Commit 22: Documentation
```bash
git add backend/SETUP.md
git commit -m "docs: add setup guide and API documentation

- Add setup instructions for Prisma migration
- Document all available API routes
- Include Postman testing examples
- Add environment variables configuration"
```

---

## Notes importantes:

1. **Ordre logique**: Les commits suivent un ordre logique de développement :
   - Schéma de base de données d'abord
   - Infrastructure (JWT, middlewares)
   - Authentification
   - Produits (core feature)
   - Catégories
   - Commandes (dépend des produits)
   - Documentation

2. **Commits atomiques**: Chaque commit représente une fonctionnalité complète et testable

3. **Messages de commit**: Utilisent le format conventionnel (feat, chore, docs) et décrivent clairement les changements

4. **Dépendances**: Respectez l'ordre car certains commits dépendent des précédents (ex: routes après handlers)

