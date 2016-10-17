package model

import "strconv"

// Unimplement For extra clarity
type Unimplement struct {
	Value
}

// HTTPCode For extra clarity
type HTTPCode int // e.g. 200

func (t HTTPCode) String() string {
	return strconv.Itoa(int(t))
}

// SupportToCheckEmpty implement IsEmpty() instance
type SupportToCheckEmpty interface {
	IsEmpty() bool
}

type typoCheck map[string]*Value

func (t typoCheck) IsEmpty() bool {
	return len(t) == 0
}

func (t typoCheck) Names() []string {
	names := []string{}
	for name := range t {
		names = append(names, name)
	}
	return names
}

// RAML built-in types
const (
	TypeNull    = "null"
	TypeBoolean = "boolean"
	TypeInteger = "integer"
	TypeNumber  = "number"
	TypeString  = "string"
	TypeObject  = "object"
	TypeArray   = "array"
	TypeFile    = "file"
	TypeBinary  = "binary"
)
