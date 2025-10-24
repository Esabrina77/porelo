package main

import (
	"fmt"
	"net/http"
)

type Items struct {
	ID   int
	Name string
}

func main() {

	//http
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		fmt.Fprintln(w, "TEST CONNEXION")

	})

	http.ListenAndServe(":8080", nil)
}
