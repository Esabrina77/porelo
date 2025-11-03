// Contient la logique métier pour accéder aux users
package services

import (
	"api/internal/db"
	"api/internal/models"
	"api/internal/utils"
	"context"
	"fmt"
)

// Récupérer un user par son email
func GetUserByEmail(client *db.PrismaClient, email string) (*models.User, error) {
	ctx := context.Background()
	u, err := client.User.FindUnique(
		db.User.Email.Equals(email),
	).Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("Erreur de récupération user par email : %w", err)
	}
	if u == nil {
		return nil, nil
	}
	return &models.User{
		ID:        u.ID,
		Email:     u.Email,
		Password:  u.Password,
		Role:      string(u.Role),
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

// créer un user
func CreateUser(client *db.PrismaClient, email string, password string) (*models.User, error) {
	ctx := context.Background()
	//hasher le password
	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	//verifier si l'email existe déjà
	existingUser, err := GetUserByEmail(client, email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, fmt.Errorf("L'email existe déjà")
	}

	newUser, err := client.User.CreateOne(
		db.User.Email.Set(email),
		db.User.Password.Set(hash), //utilisation du hash
	).Exec(ctx)
	if err != nil {
		return nil, err
	}

	return &models.User{
		ID:        newUser.ID,
		Email:     newUser.Email,
		Password:  newUser.Password, // le mot de passe hashé
		Role:      string(newUser.Role),
		CreatedAt: newUser.CreatedAt,
		UpdatedAt: newUser.UpdatedAt,
	}, nil
}

// Récuperer un user par son ID
func GetUserByID(client *db.PrismaClient, userID string) (*models.User, error) {

	ctx := context.Background()
	u, err := client.User.FindUnique(

		db.User.ID.Equals(userID),
	).Exec(ctx)

	if err != nil {
		return nil, fmt.Errorf("Erreur de récupération user : %w", err)
	}
	if u == nil {
		return nil, nil
	}

	return &models.User{
		ID:        u.ID,
		Email:     u.Email,
		Password:  u.Password,
		Role:      string(u.Role),
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

// func GetAllUsers (client *db.PrismaConfig , )
func GetAllUsers(client *db.PrismaClient) ([]models.User, error) {
	ctx := context.Background()

	dataUsers, err := client.User.FindMany().Exec(ctx)
	if err != nil {
		return nil, err
	}

	users := make([]models.User, len(dataUsers))
	for i, u := range dataUsers {
		users[i] = models.User{
			ID:        u.ID,
			Email:     u.Email,
			Password:  u.Password,
			Role:      string(u.Role),
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		}
	}

	return users, nil
}

// Modifier un champ d'un user
func UpdateUser(client *db.PrismaClient, userID, email, password string) (*models.User, error) {
	ctx := context.Background()
	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	u, err := client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Email.Set(email),
		db.User.Password.Set(hash),
	).Exec(ctx)
	if err != nil {
		return nil, err
	}
	return &models.User{
		ID:        u.ID,
		Email:     u.Email,
		Password:  u.Password,
		Role:      string(u.Role),
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}, nil
}

// Supprimer un user
func DeleteUser(client *db.PrismaClient, userID string) error {
	ctx := context.Background()
	_, err := client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Delete().Exec(ctx)
	return err
}
