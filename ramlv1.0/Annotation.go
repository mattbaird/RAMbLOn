package model

import ()

// Annotations map of Annotation
type Annotations map[string]*Annotation

// IsEmpty return true if it is empty
func (t Annotations) IsEmpty() bool {
	for _, elem := range t {
		if elem != nil {
			if !elem.IsEmpty() {
				return false
			}
		}
	}
	return true
}

// Annotation wrap types defined in spec
type Annotation struct {
	Value

	// fill by fixAnnotationBracket
	Name string `yaml:"-"`
	// fill by fillAnnotation
	AnnotationType AnnotationType `yaml:"-"`
}
