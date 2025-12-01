# Setup Instructions

## Prerequisites
1. Run Prisma migration to update the database schema:
   ```bash
   npx prisma migrate dev --name add_category_order
   ```

2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Make sure your `.env` file contains:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your-secret-key-here"
   PORT="8080"
   ```

## Available Routes

### Authentication (Public)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Authentication (Protected)
- `GET /auth/me` - Get current user info (requires JWT)

### Products (Public)
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID

### Products (Admin Only)
- `POST /admin/products` - Create product (requires JWT + ADMIN role)
- `PUT /admin/products/{id}` - Update product (requires JWT + ADMIN role)
- `DELETE /admin/products/{id}` - Delete product (requires JWT + ADMIN role)

### Categories (Admin Only)
- `GET /admin/categories` - Get all categories (requires JWT + ADMIN role)
- `GET /admin/categories/{id}` - Get category by ID (requires JWT + ADMIN role)
- `POST /admin/categories` - Create category (requires JWT + ADMIN role)
- `PUT /admin/categories/{id}` - Update category (requires JWT + ADMIN role)
- `DELETE /admin/categories/{id}` - Delete category (requires JWT + ADMIN role)

### Orders (Authenticated Users)
- `POST /orders` - Create order (requires JWT)
- `GET /orders` - Get current user's orders (requires JWT)
- `GET /orders/{id}` - Get order by ID (requires JWT, own order or ADMIN)

### Orders (Admin Only)
- `GET /admin/orders` - Get all orders (requires JWT + ADMIN role)
- `PUT /admin/orders/{id}/status` - Update order status (requires JWT + ADMIN role)

## Testing with Postman

### 1. Register a user
```
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Login to get JWT token
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response will contain a `token` field. Use this token in the Authorization header for protected routes.

### 3. Use JWT token for protected routes
Add to Headers:
```
Authorization: Bearer <your-token-here>
```

