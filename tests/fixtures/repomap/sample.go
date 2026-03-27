package main

import (
	"fmt"
	"net/http"
)

// UserService handles user operations.
type UserService struct {
	DB *Database
}

// GetUser fetches a user by ID (exported — uppercase).
func (s *UserService) GetUser(id int) (*User, error) {
	return s.DB.Find(id)
}

// createHandler is unexported (lowercase).
func createHandler() http.Handler {
	return nil
}

// StartServer starts the HTTP server (exported).
func StartServer(port int) error {
	addr := fmt.Sprintf(":%d", port)
	return http.ListenAndServe(addr, nil)
}

type internalConfig struct {
	debug bool
}
