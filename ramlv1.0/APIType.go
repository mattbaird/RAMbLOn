package parser

import (
	"fmt"
	"github.com/tsaikd/yaml"
	"io/ioutil"
	"path/filepath"
	"strconv"
	"strings"

	parserConfig "github.com/mattbaird/RAMbLOn/ramlv1.0/parserConfig"
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

var _ fillTypes = &APITypes{}

func (t *APITypes) fillTypes(conf PostProcessConfig) (err error) {
	fmt.Printf("fillTypes\n")
	if t.includeTag {
		fpath := filepath.Join(conf.RootDocument().WorkingDirectory, t.Value.String)
		fmt.Printf("fillTypes includeTag:%v\n", fpath)
		var fdata []byte
		fdata, err = ioutil.ReadFile(fpath)
		if err == nil {
			// unmarshal the types
			// MBAIRD: this is wrong,
			fmt.Printf("unmarhsaling\n")
			t.MapAPITypes = MapAPITypes{}
			err = yaml.Unmarshal(fdata, &t.MapAPITypes)
		} else {
			fmt.Printf("Error:%v\n", err)
		}
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
	if err := apiType.BeforeUnmarshalYAML(); err != nil {
		panic(err)
	}
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

// BeforeUnmarshalYAML implement yaml Initiator
func (t *APIType) BeforeUnmarshalYAML() (err error) {
	if err = t.ObjectType.BeforeUnmarshalYAML(); err != nil {
		return
	}
	if err = t.String.BeforeUnmarshalYAML(); err != nil {
		return
	}
	if err = t.ArrayType.BeforeUnmarshalYAML(); err != nil {
		return
	}
	if err = t.FileType.BeforeUnmarshalYAML(); err != nil {
		return
	}
	return
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

var _ fillProperties = &APIType{}

func (t *APIType) fillProperties(library Library) (err error) {
	if t == nil {
		return
	}

	// fill Properties if possible
	switch t.BaseType {
	case "", TypeBoolean, TypeInteger, TypeNumber, TypeString, TypeObject, TypeFile:
		// no more action for RAML built-in type
		return
	default:
		if isInlineAPIType(*t) {
			// no more action if declared by JSON
			return
		}

		var typ *APIType
		var exist bool
		if typ, exist = library.Types.get(t.BaseType); !exist {
			return ErrorTypeUndefined1.New(nil, t.Type)
		}

		mergeAPIType(t, *typ)

		return
	}
}

var _ fillExample = &APIType{}

func (t *APIType) fillExample(conf PostProcessConfig) (err error) {
	fmt.Printf("fillExample\n")
	if t == nil {
		return
	}

	if t.Example.IsEmpty() {
		if t.Example, err = generateExample(*conf.Library(), *t, false); err != nil {
			return
		}
	}
	if t.Examples.IsEmpty() {
		if t.Examples, err = generateExamples(*conf.Library(), *t, false); err != nil {
			return
		}
	}

	if err = fillExampleAPIType(&t.Example, conf, *t); err != nil {
		return
	}
	for _, example := range t.Examples {
		if err = fillExampleAPIType(example, conf, *t); err != nil {
			return
		}
	}

	return
}

func fillExampleAPIType(example *Example, conf PostProcessConfig, apiType APIType) (err error) {
	if example == nil || example.IsEmpty() {
		return
	}

	if example.includeTag && TypeString == example.Value.Type {
		fpath := filepath.Join(conf.RootDocument().WorkingDirectory, example.Value.String)
		var fdata []byte
		if fdata, err = ioutil.ReadFile(fpath); err != nil {
			return
		}
		switch apiType.Type {
		case TypeFile:
			if example.Value, err = NewValue(fdata); err != nil {
				return
			}
		default:
			return ErrorUnsupportedIncludeType1.New(nil, apiType.Type)
		}
	}

	if err = fillValueFromAPIType(&example.Value, *conf.Library(), apiType); err != nil {
		return
	}

	return
}

func fillValueFromAPIType(value *Value, library Library, apiType APIType) (err error) {
	if value == nil {
		return nil
	}

	if value.IsEmpty() {
		if *value, err = generateExampleValue(library, apiType, false); err != nil {
			return
		}
	}

	// not support fill value from inline APIType
	if isInlineAPIType(apiType) {
		return
	}

	for name, v := range value.Map {
		if v == nil {
			v = &Value{}
			value.Map[name] = v
		}
		property := apiType.Properties.Map()[name]
		if property == nil {
			return ErrorPropertyUndefined2.New(nil, name, apiType.Type)
		}
		if err = fillValueFromAPIType(v, library, property.APIType); err != nil {
			return
		}
	}
	return nil
}

var _ checkExample = &APIType{}

func (t *APIType) checkExample(conf PostProcessConfig) (err error) {
	if t == nil {
		return
	}

	options := []CheckValueOption{}
	confOptions, err := conf.Parser().Get(parserConfig.CheckValueOptions)
	if err == nil {
		if opts, ok := confOptions.([]CheckValueOption); ok {
			options = opts
		}
	}

	if !t.Example.Value.IsZero() {
		if err = CheckValueAPIType(*t, t.Example.Value, options...); err != nil {
			return
		}
	}
	for _, example := range t.Examples {
		if !example.Value.IsZero() {
			if err = CheckValueAPIType(*t, example.Value, options...); err != nil {
				return
			}
		}
	}

	return
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
