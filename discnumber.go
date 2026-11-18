package main

func optionalPositiveInt(value int) *int {
	if value < 1 {
		return nil
	}
	return &value
}
