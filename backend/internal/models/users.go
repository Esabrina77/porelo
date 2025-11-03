package models

import "time"

type UserRequest struct {
	Email    string
	Password string
}

type User struct {
	ID        string
	Email     string
	Password  string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
