package model

import (
	"fmt"
	"regexp"
)

// Resources map of Resource
type Resources map[string]*Resource

// IsEmpty return true if it is empty
func (t Resources) IsEmpty() bool {
	for _, elem := range t {
		if elem != nil {
			if !elem.IsEmpty() {
				return false
			}
		}
	}
	return true
}

func (t Resources) FillURIParams() (err error) {
	if t == nil {
		return
	}
	regexpURIParam := regexp.MustCompile(`{(\w+)}`)
	for name, elem := range t {
		if name == "/org/{orgId}/engine/{engineId}/env/{envId}/project/{projectId}" {
			fmt.Printf("Resource: %s:%+v\n", name, elem.URIParameters)
			if elem.URIParameters.MapAPITypes == nil {
				elem.URIParameters.MapAPITypes = make(map[string]*APIType)
			}
		}

		matches := regexpURIParam.FindAllStringSubmatch(name, -1)
		for _, matchParams := range matches {
			if len(matchParams) < 2 {
				continue
			}
			paramName := matchParams[1]
			if _, exist := elem.URIParameters.MapAPITypes[paramName]; !exist {
				if elem.URIParameters.MapAPITypes == nil {
					elem.URIParameters.MapAPITypes = make(map[string]*APIType)
				}
				_, ok := elem.URIParameters.MapAPITypes[paramName]
				if !ok {
					if name == "/org/{orgId}/engine/{engineId}/env/{envId}/project/{projectId}" {
						fmt.Printf("Didn't find %s: creating new\n", paramName)
					}
					elem.URIParameters.MapAPITypes[paramName] = NewAPIType()
					elem.URIParameters.MapAPITypes[paramName].Type = elem.URIParameters.Value.get(paramName).Type
					elem.URIParameters.MapAPITypes[paramName].Description = elem.URIParameters.Value.get(paramName).Description
				}
			}
		}
	}
	return
}

// Resource is identified by its relative URI, which MUST begin with a slash
// ("/"). Every node whose key begins with a slash, and is either at the root
// of the API definition or is the child node of a resource node, is such
// a resource node.
type Resource struct {
	// An alternate, human-friendly name for the resource. If the displayName
	// node is not defined for a resource, documentation tools SHOULD refer to
	// the resource by its key, which acts as the resource name. For example,
	// tools should refer to the relative URI /jobs.
	DisplayName string `yaml:"displayName" json:"displayName,omitempty"`

	// A substantial, human-friendly description of a resource. Its value is a
	// string and MAY be formatted using markdown.
	Description string `yaml:"description" json:"description,omitempty"`

	// Annotations to be applied to this API. An annotation is a map having
	// a key that begins with "(" and ends with ")" where the text enclosed in
	// parentheses is the annotation name, and the value is an instance of that
	// annotation.
	Annotations Annotations `yaml:",regexp:\\(.*\\)" json:"annotations,omitempty"`

	// The object describing the method.
	Methods Methods `yaml:",regexp:(get|patch|put|post|delete|options|head)" json:"methods,omitempty"`

	// A list of traits to apply to all methods declared (implicitly or
	// explicitly) for this resource. Individual methods can override this
	// declaration.
	Is IsTraits `yaml:"is" json:"is,omitempty"`

	// The resource type that this resource inherits.
	Type APIType `yaml:"type" json:"type,omitempty"`

	// The security schemes that apply to all methods declared (implicitly or
	// explicitly) for this resource.
	SecuredBy Unimplement `yaml:"securedBy" json:"securedBy,omitempty"`

	// Detailed information about any URI parameters of this resource.
	URIParameters APITypes `yaml:"uriParameters" json:"uriParameters,omitempty"`

	// A nested resource, which is identified as any node whose name begins
	// with a slash ("/"), and is therefore treated as a relative URI.
	Resources Resources `yaml:",regexp:/.*" json:"resources,omitempty"`
}

// IsEmpty return true if it is empty
func (t Resource) IsEmpty() bool {
	return t.DisplayName == "" &&
		t.Description == "" &&
		t.Annotations.IsEmpty() &&
		t.Methods.IsEmpty() &&
		t.Is.IsEmpty() &&
		t.Type.IsEmpty() &&
		t.SecuredBy.IsEmpty() &&
		t.URIParameters.IsEmpty() &&
		t.Resources.IsEmpty()
}
