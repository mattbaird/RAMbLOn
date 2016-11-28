package model

import (
	"strconv"
	"strings"
)

type MapAPITypes map[string]*APIType

// IsEmpty return true if Example is empty
func (t MapAPITypes) IsEmpty() bool {
	return t.IsEmpty()
}

// APITypes wraps map of APIType for unmarshal YAML
type APITypes struct {
	MapAPITypes
	includeTag bool
	Value      Value
}

func (t *APITypes) get(typeString string) (*APIType, bool) {
	ts := typeString
	if strings.HasSuffix(typeString, "[]") {
		ts = typeString[0 : len(typeString)-2]
	}
	typ, exists := t.MapAPITypes[ts]
	return typ, exists
}

// UnmarshalYAMLTag unmarshal an ApiTypes which MIGHT be a simple string or a
// map[string]*APIType{}
func (t *APITypes) UnmarshalYAMLTag(unmarshaler func(interface{}) error, tag string) (err error) {
	// check include first
	if tag == "!include" {
		t.includeTag = true
	}
	if err = unmarshaler(&t.Value); err == nil && !t.Value.IsEmpty() {
		return
	}

	if err = unmarshaler(&t.MapAPITypes); err == nil && !t.MapAPITypes.IsEmpty() {
		return
	}

	return
}

// IsEmpty return true if it is empty
func (t APITypes) IsEmpty() bool {
	for _, elem := range t.MapAPITypes {
		if elem != nil {
			if !elem.IsEmpty() {
				return false
			}
		}
	}
	return true
}

// NewAPIType return empty APIType
func NewAPIType() *APIType {
	apiType := &APIType{}
	return apiType
}

// APIType wrap types defined in spec
type APIType struct {
	TypeDeclaration
	ObjectType
	ScalarType
	String
	ArrayType
	FileType

	// Type without [] suffix
	BaseType string `yaml:"-" json:"-"`
	// used when custom type, NativeType store the type that should be checked
	NativeType string `yaml:"-" json:"-"`
	// IsArray means the NativeType is array or not
	IsArray bool `yaml:"-" json:"-"`
}

// UnmarshalYAML implement yaml unmarshaler
func (t *APIType) UnmarshalYAML(unmarshaler func(interface{}) error) (err error) {
	if err = unmarshaler(&t.TypeDeclaration); err != nil {
		return
	}
	t.setType(t.TypeDeclaration.Type)
	if t.IsArray {
		if err = unmarshaler(&t.ArrayType); err != nil {
			return
		}
	}
	if err = unmarshaler(&t.ObjectType); err != nil {
		return
	}
	if !t.ObjectType.IsEmpty() {
		if t.TypeDeclaration.Type == "" {
			t.setType(TypeObject)
		}
		return nil
	}
	if err = unmarshaler(&t.ScalarType); err != nil {
		return
	}
	if err = unmarshaler(&t.String); err != nil {
		return
	}
	if err = unmarshaler(&t.FileType); err != nil {
		return
	}
	return nil
}

// IsEmpty return true if it is empty
func (t APIType) IsEmpty() bool {
	return t.TypeDeclaration.IsEmpty() &&
		t.ObjectType.IsEmpty() &&
		t.ScalarType.IsEmpty() &&
		t.String.IsEmpty() &&
		t.ArrayType.IsEmpty() &&
		t.FileType.IsEmpty() &&
		t.BaseType == "" &&
		t.NativeType == "" &&
		t.IsArray == false
}

func (t *APIType) setType(name string) {
	t.Type = name
	t.BaseType, t.IsArray = IsArrayType(name)
	t.NativeType = t.BaseType
}

// NewValueWithAPIType return Value from src with apiType check
func NewValueWithAPIType(apiType APIType, src interface{}) (Value, error) {
	srcval, err := NewValue(src)
	if err != nil {
		return srcval, err
	}

	if apiType.IsArray {
		switch srcval.Type {
		case TypeArray:
			elemType := apiType
			elemType.IsArray = false
			result := make([]*Value, len(srcval.Array))
			for i, srcelem := range srcval.Array {
				var value Value
				if value, err = NewValueWithAPIType(elemType, srcelem); err != nil {
					return srcval, err
				}
				result[i] = &value
			}
			return Value{
				Type:  TypeArray,
				Array: result,
			}, nil
		case TypeNull:
			return Value{
				Type:  TypeArray,
				Array: []*Value{},
			}, nil
		}
		return srcval, ErrorTypeConvertFailed2.New(nil, srcval.Type, apiType.Type)
	}

	switch apiType.NativeType {
	case TypeBoolean:
		switch srcval.Type {
		case apiType.NativeType:
		case TypeString:
			var natval bool
			if natval, err = strconv.ParseBool(srcval.String); err != nil {
				return srcval, err
			}
			return Value{
				Type:    apiType.NativeType,
				Boolean: natval,
			}, nil
		default:
			return srcval, ErrorTypeConvertFailed2.New(nil, srcval.Type, apiType.Type)
		}
	case TypeInteger:
		switch srcval.Type {
		case apiType.NativeType:
		case TypeString:
			var natval int64
			if natval, err = strconv.ParseInt(srcval.String, 0, 64); err != nil {
				return srcval, err
			}
			return Value{
				Type:    apiType.NativeType,
				Integer: natval,
			}, nil
		default:
			return srcval, ErrorTypeConvertFailed2.New(nil, srcval.Type, apiType.Type)
		}
	case TypeNumber:
		switch srcval.Type {
		case apiType.NativeType:
		case TypeString:
			var natval float64
			if natval, err = strconv.ParseFloat(srcval.String, 64); err != nil {
				return srcval, err
			}
			return Value{
				Type:   apiType.NativeType,
				Number: natval,
			}, nil
		default:
			return srcval, ErrorTypeConvertFailed2.New(nil, srcval.Type, apiType.Type)
		}
	case TypeObject:
		switch srcval.Type {
		case TypeObject:
			val := Value{
				Type: TypeObject,
				Map:  map[string]*Value{},
			}
			for name, prop := range apiType.Properties.Map() {
				var propval Value
				if propval, err = NewValueWithAPIType(prop.APIType, srcval.Map[name]); err != nil {
					return val, err
				}
				val.Map[name] = &propval
			}
			return val, nil
		default:
			return srcval, ErrorTypeConvertFailed2.New(nil, srcval.Type, apiType.Type)
		}
	}

	return srcval, nil
}
