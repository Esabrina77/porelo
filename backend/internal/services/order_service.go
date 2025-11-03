package services

import (
	"api/internal/db"
	"api/internal/dtos"
	"context"
	"fmt"
)

// CreateOrder crée une nouvelle commande avec ses items
func CreateOrder(client *db.PrismaClient, userID string, req dtos.CreateOrderRequest) (*dtos.OrderResponse, error) {
	ctx := context.Background()

	if len(req.Items) == 0 {
		return nil, fmt.Errorf("une commande doit contenir au moins un produit")
	}

	// Calculer le montant total et vérifier le stock
	var totalAmount float64
	type itemData struct {
		ProductID string
		Quantity  int
		Price     float64
		Stock     int
	}
	var itemsData []itemData

	for _, item := range req.Items {
		// Récupérer le produit
		product, err := client.Product.FindUnique(
			db.Product.ID.Equals(item.ProductID),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("produit avec l'ID %s non trouvé", item.ProductID)
		}

		// Vérifier le stock
		if product.Stock < item.Quantity {
			return nil, fmt.Errorf("stock insuffisant pour le produit %s (stock disponible: %d)", product.Name, product.Stock)
		}

		// Calculer le prix total pour cet item
		itemTotal := product.Price * float64(item.Quantity)
		totalAmount += itemTotal

		itemsData = append(itemsData, itemData{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price,
			Stock:     product.Stock,
		})
	}

	// Créer la commande - TotalAmount doit être en premier
	order, err := client.Order.CreateOne(
		db.Order.TotalAmount.Set(totalAmount),
		db.Order.User.Link(db.User.ID.Equals(userID)),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création de la commande: %w", err)
	}

	// Mettre à jour le statut
	order, err = client.Order.FindUnique(
		db.Order.ID.Equals(order.ID),
	).Update(
		db.Order.Status.Set(db.OrderStatus("PENDING")),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la création de la commande: %w", err)
	}

	// Créer les items de commande et mettre à jour le stock
	for _, itemData := range itemsData {
		// Créer l'item de commande - ordre: Quantity, Price, Order, Product
		_, err := client.OrderItem.CreateOne(
			db.OrderItem.Quantity.Set(itemData.Quantity),
			db.OrderItem.Price.Set(itemData.Price),
			db.OrderItem.Order.Link(db.Order.ID.Equals(order.ID)),
			db.OrderItem.Product.Link(db.Product.ID.Equals(itemData.ProductID)),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la création de l'item de commande: %w", err)
		}

		// Mettre à jour le stock
		newStock := itemData.Stock - itemData.Quantity
		_, err = client.Product.FindUnique(
			db.Product.ID.Equals(itemData.ProductID),
		).Update(
			db.Product.Stock.Set(newStock),
		).Exec(ctx)
		if err != nil {
			return nil, fmt.Errorf("erreur lors de la mise à jour du stock: %w", err)
		}
	}

	// Récupérer la commande complète avec les items
	order, err = client.Order.FindUnique(
		db.Order.ID.Equals(order.ID),
	).With(
		db.Order.OrderItems.Fetch().With(
			db.OrderItem.Product.Fetch(),
		),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération de la commande: %w", err)
	}

	return convertOrderToDTO(order), nil
}

// GetAllOrders récupère toutes les commandes (admin only)
func GetAllOrders(client *db.PrismaClient) ([]dtos.OrderResponse, error) {
	ctx := context.Background()

	orders, err := client.Order.FindMany().With(
		db.Order.OrderItems.Fetch().With(
			db.OrderItem.Product.Fetch(),
		),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des commandes: %w", err)
	}

	result := make([]dtos.OrderResponse, len(orders))
	for i, order := range orders {
		result[i] = *convertOrderToDTO(&order)
	}

	return result, nil
}

// GetUserOrders récupère les commandes d'un utilisateur
func GetUserOrders(client *db.PrismaClient, userID string) ([]dtos.OrderResponse, error) {
	ctx := context.Background()

	orders, err := client.Order.FindMany(
		db.Order.UserID.Equals(userID),
	).With(
		db.Order.OrderItems.Fetch().With(
			db.OrderItem.Product.Fetch(),
		),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération des commandes: %w", err)
	}

	result := make([]dtos.OrderResponse, len(orders))
	for i, order := range orders {
		result[i] = *convertOrderToDTO(&order)
	}

	return result, nil
}

// GetOrderByID récupère une commande par son ID
func GetOrderByID(client *db.PrismaClient, orderID string, userID string, isAdmin bool) (*dtos.OrderResponse, error) {
	ctx := context.Background()

	order, err := client.Order.FindUnique(
		db.Order.ID.Equals(orderID),
	).With(
		db.Order.OrderItems.Fetch().With(
			db.OrderItem.Product.Fetch(),
		),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("commande non trouvée")
	}

	// Vérifier que l'utilisateur peut voir cette commande
	if !isAdmin && order.UserID != userID {
		return nil, fmt.Errorf("accès non autorisé à cette commande")
	}

	return convertOrderToDTO(order), nil
}

// UpdateOrderStatus met à jour le statut d'une commande (admin only)
func UpdateOrderStatus(client *db.PrismaClient, orderID string, status db.OrderStatus) (*dtos.OrderResponse, error) {
	ctx := context.Background()

	_, err := client.Order.FindUnique(
		db.Order.ID.Equals(orderID),
	).Update(
		db.Order.Status.Set(status),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la mise à jour du statut de la commande: %w", err)
	}

	// Récupérer la commande mise à jour avec les items
	order, err := client.Order.FindUnique(
		db.Order.ID.Equals(orderID),
	).With(
		db.Order.OrderItems.Fetch().With(
			db.OrderItem.Product.Fetch(),
		),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la récupération de la commande: %w", err)
	}

	return convertOrderToDTO(order), nil
}

// convertOrderToDTO convertit un OrderModel en OrderResponse
func convertOrderToDTO(order *db.OrderModel) *dtos.OrderResponse {
	orderItems := make([]dtos.OrderItemResponse, len(order.OrderItems()))
	for i, item := range order.OrderItems() {
		product := item.Product()
		orderItems[i] = dtos.OrderItemResponse{
			ID:       item.ID,
			Quantity: item.Quantity,
			Price:    item.Price,
			Product: dtos.ProductResponse{
				ID:   product.ID,
				Name: product.Name,
				Description: func() string {
					desc, ok := product.Description()
					if ok {
						return string(desc)
					}
					return ""
				}(),
				Price: product.Price,
				Stock: product.Stock,
				ImageURL: func() string {
					img, ok := product.ImageURL()
					if ok {
						return string(img)
					}
					return ""
				}(),
				CreatedAt: product.CreatedAt,
				UpdatedAt: product.UpdatedAt,
			},
		}
	}

	return &dtos.OrderResponse{
		ID:          order.ID,
		OrderDate:   order.OrderDate,
		TotalAmount: order.TotalAmount,
		Status:      string(order.Status),
		UserID:      order.UserID,
		OrderItems:  orderItems,
		CreatedAt:   order.CreatedAt,
		UpdatedAt:   order.UpdatedAt,
	}
}

// Helper function to get string value from optional field
func getStringValue(value db.String, ok bool) string {
	if !ok {
		return ""
	}
	return string(value)
}

// getOptionalString helper for product fields
func getOptionalString(value string) string {
	return value
}
