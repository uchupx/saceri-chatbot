package helper

import (
	"fmt"
	"strconv"
)


func StringToInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		fmt.Println(err)
		return 0
	}

	return i
}
