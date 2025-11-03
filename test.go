package main

import "fmt"

func main() {

	var monInt interface{} = 10.3
	l, res := monInt.(int)
	fmt.Println(l, res)
}
