package main

import "testing"

func TestOptionalPositiveInt(t *testing.T) {
	for _, value := range []int{-1, 0, 1, 2} {
		got := optionalPositiveInt(value)
		if value < 1 && got != nil || value > 0 && (got == nil || *got != value) {
			t.Errorf("optionalPositiveInt(%d) = %v", value, got)
		}
	}
}
