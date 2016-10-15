package model

import (
	"bytes"
	"encoding/gob"
	"strings"
	"testing"

	raml "github.com/mattbaird/RAMbLOn/ramlv1.0/parserConfig"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/tsaikd/KDGoLib/jsonex"
	"github.com/tsaikd/KDGoLib/testutil/requireutil"
)

func Test_ParseError(t *testing.T) {
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	err := parser.Config(0, nil)
	require.Error(err)
	require.True(ErrorUnsupportedParserConfig1.Match(err))

	err = parser.Config(parserConfig.CheckRAMLVersion, nil)
	require.Error(err)
	require.True(ErrorInvalidParserConfigValueType3.Match(err))

	err = parser.Config(parserConfig.CheckRAMLVersion, true)
	require.NoError(err)

	err = parser.Config(parserConfig.CheckValueOptions, nil)
	require.Error(err)

	err = parser.Config(parserConfig.CheckValueOptions, []CheckValueOption{CheckValueOptionAllowIntegerToBeNumber(true)})
	require.NoError(err)

	err = parser.Config(parserConfig.CheckValueOptions, "error")
	require.Error(err)

	_, err = parser.ParseData([]byte("#%RAML 0.8\n"), ".")
	require.Error(err)
	require.True(ErrorUnexpectedRAMLVersion2.Match(err))

	_, err = parser.ParseData([]byte(strings.TrimSpace(`
#%RAML 1.0

/get/error:
    get:
        response:
            200:
                body:
                    application/json:
                        type: string

	`)), ".")
	require.Error(err)
	require.True(ErrorTypo2.Match(err))
}

func Test_ParseAnnotationsAnnotationTargets(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/annotations/annotation-targets.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Illustrating allowed targets", rootdoc.Title)
	require.Equal("application/json", rootdoc.MediaType)
	if assert.Contains(rootdoc.AnnotationTypes, "meta-resource-method") {
		annotationType := rootdoc.AnnotationTypes["meta-resource-method"]
		if assert.Len(annotationType.AllowedTargets, 2) {
			require.Equal(TargetLocationResource, annotationType.AllowedTargets[0])
			require.Equal(TargetLocationMethod, annotationType.AllowedTargets[1])
		}
	}
	if assert.Contains(rootdoc.AnnotationTypes, "meta-data") {
		annotationType := rootdoc.AnnotationTypes["meta-data"]
		if assert.Len(annotationType.AllowedTargets, 1) {
			require.Equal(TargetLocationTypeDeclaration, annotationType.AllowedTargets[0])
		}
	}
	if assert.Contains(rootdoc.Types, "User") {
		apiType := rootdoc.Types["User"]
		require.Equal(TypeObject, apiType.Type)
		if assert.Contains(apiType.Annotations, "meta-data") {
			annotation := apiType.Annotations["meta-data"]
			require.Equal("on an object; on a data type declaration", annotation.String)
		}
		if assert.Contains(apiType.Properties.Map(), "name") {
			property := apiType.Properties.Map()["name"]
			require.Equal(TypeString, property.Type)
			if assert.Contains(property.Annotations, "meta-data") {
				annotation := property.Annotations["meta-data"]
				require.Equal("on a string property", annotation.String)
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/users") {
		resource := rootdoc.Resources["/users"]
		if assert.Contains(resource.Annotations, "meta-resource-method") {
			annotation := resource.Annotations["meta-resource-method"]
			require.Equal("on a resource", annotation.String)
		}
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Annotations, "meta-resource-method") {
				annotation := method.Annotations["meta-resource-method"]
				require.Equal("on a method", annotation.String)
			}
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[HTTPCode(200)]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("User[]", body.Type)
					if assert.Contains(body.Annotations, "meta-data") {
						annotation := body.Annotations["meta-data"]
						require.Equal("on a body", annotation.String)
					}
				}
			}
		}
	}
}

func Test_ParseAnnotationsSimpleAnnotations(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/annotations/simple-annotations.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Illustrating annotations", rootdoc.Title)
	require.Equal("application/json", rootdoc.MediaType)
	if assert.Contains(rootdoc.AnnotationTypes, "testHarness") {
		annotationType := rootdoc.AnnotationTypes["testHarness"]
		require.Equal(TypeString, annotationType.Type)
	}
	if assert.Contains(rootdoc.AnnotationTypes, "badge") {
		annotationType := rootdoc.AnnotationTypes["badge"]
		require.Equal(TypeString, annotationType.Type)
	}
	if assert.Contains(rootdoc.AnnotationTypes, "clearanceLevel") {
		annotationType := rootdoc.AnnotationTypes["clearanceLevel"]
		require.Equal(TypeObject, annotationType.Type)
		if assert.Contains(annotationType.Properties.Map(), "level") {
			property := annotationType.Properties.Map()["level"]
			require.Len(property.Enum, 3)
			require.True(property.Required)
		}
		if assert.Contains(annotationType.Properties.Map(), "signature") {
			property := annotationType.Properties.Map()["signature"]
			require.Equal("\\d{3}-\\w{12}", property.Pattern)
			require.True(property.Required)
		}
	}
	if assert.Contains(rootdoc.Resources, "/users") {
		resource := rootdoc.Resources["/users"]
		if assert.Contains(resource.Annotations, "testHarness") {
			annotation := resource.Annotations["testHarness"]
			require.Equal("usersTest", annotation.String)
		}
		if assert.Contains(resource.Annotations, "badge") {
			annotation := resource.Annotations["badge"]
			require.Equal("tested.gif", annotation.String)
		}
		if assert.Contains(resource.Annotations, "clearanceLevel") {
			annotation := resource.Annotations["clearanceLevel"]
			if assert.Contains(annotation.Map, "level") {
				value := annotation.Map["level"]
				require.Equal("high", value.String)
			}
			if assert.Contains(annotation.Map, "signature") {
				value := annotation.Map["signature"]
				require.Equal("230-ghtwvfrs1itr", value.String)
			}
		}
	}
}

func Test_ParseDefiningExamples(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/defining-examples/organisation-api.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("API with Examples", rootdoc.Title)
	if assert.Contains(rootdoc.Types, "User") {
		typ := rootdoc.Types["User"]
		require.Equal(TypeObject, typ.Type)
		if assert.Contains(typ.Properties.Map(), "name") {
			property := typ.Properties.Map()["name"]
			require.Equal(TypeString, property.Type)
		}
		if assert.Contains(typ.Properties.Map(), "lastname") {
			property := typ.Properties.Map()["lastname"]
			require.Equal(TypeString, property.Type)
		}
		require.False(typ.Example.Value.IsEmpty())
		require.Equal("Bob", typ.Example.Value.Map["name"].String)
		require.Equal("Marley", typ.Example.Value.Map["lastname"].String)
	}
	if assert.Contains(rootdoc.Types, "Org") {
		typ := rootdoc.Types["Org"]
		require.Equal(TypeObject, typ.Type)
		if assert.Contains(typ.Properties.Map(), "name") {
			property := typ.Properties.Map()["name"]
			require.Equal(TypeString, property.Type)
			require.True(property.Required)
		}
		if assert.Contains(typ.Properties.Map(), "address") {
			property := typ.Properties.Map()["address"]
			require.Equal(TypeString, property.Type)
			require.False(property.Required)
		}
		if assert.Contains(typ.Properties.Map(), "value") {
			property := typ.Properties.Map()["value"]
			require.Equal(TypeString, property.Type)
			require.False(property.Required)
		}
	}
	if assert.Contains(rootdoc.Resources, "/organisation") {
		resource := rootdoc.Resources["/organisation"]
		if assert.Contains(resource.Methods, "post") {
			method := resource.Methods["post"]
			if assert.Contains(method.Headers.Map(), "UserID") {
				header := method.Headers.Map()["UserID"]
				require.Equal("the identifier for the user that posts a new organisation", header.Description)
				require.Equal(TypeString, header.Type)
				require.Equal("SWED-123", header.Example.Value.String)
			}
			if assert.Contains(method.Bodies, "application/json") {
				body := method.Bodies["application/json"]
				require.Equal("Org", body.Type)
				if assert.Contains(body.Example.Value.Map, "name") {
					name := body.Example.Value.Map["name"]
					require.Equal("Doe Enterprise", name.String)
				}
				if assert.Contains(body.Example.Value.Map, "value") {
					value := body.Example.Value.Map["value"]
					require.Equal("Silver", value.String)
				}
			}
		}
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			require.Equal("Returns an organisation entity.", method.Description)
			if assert.Contains(method.Responses, HTTPCode(201)) {
				response := method.Responses[201]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("Org", body.Type)
					if assert.Contains(body.Examples, "acme") {
						example := body.Examples["acme"]
						require.Equal("Acme", example.Value.Map["name"].String)
					}
					if assert.Contains(body.Examples, "softwareCorp") {
						example := body.Examples["softwareCorp"]
						require.Equal("Software Corp", example.Value.Map["name"].String)
						require.Equal("35 Central Street", example.Value.Map["address"].String)
						require.Equal("Gold", example.Value.Map["value"].String)
					}
				}
			}
		}
	}
}

func Test_ParseHelloworld(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/helloworld/helloworld.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Hello world", rootdoc.Title)
	if assert.Contains(rootdoc.Resources, "/helloworld") {
		resource := rootdoc.Resources["/helloworld"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.NotEmpty(body.Type)
					require.NotEmpty(body.Example)
				}
			}
		}
	}
}

func Test_ParseOthersMobileOrderApi(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/others/mobile-order-api/api.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Mobile Order API", rootdoc.Title)
	require.Equal("1.0", rootdoc.Version)
	require.Equal("http://localhost:8081/api", rootdoc.BaseURI)
	if assert.Contains(rootdoc.Uses, "assets") {
		use := rootdoc.Uses["assets"]
		if assert.Contains(use.Types, "ProductItem") {
			typ := use.Types["ProductItem"]
			require.Equal(TypeObject, typ.Type)
			if assert.Contains(typ.Properties.Map(), "product_id") {
				property := typ.Properties.Map()["product_id"]
				require.Equal(TypeString, property.Type)
			}
			if assert.Contains(typ.Properties.Map(), "quantity") {
				property := typ.Properties.Map()["quantity"]
				require.Equal(TypeInteger, property.Type)
			}
		}
		if assert.Contains(use.Types, "Order") {
			typ := use.Types["Order"]
			require.Equal(TypeObject, typ.Type)
			if assert.Contains(typ.Properties.Map(), "order_id") {
				property := typ.Properties.Map()["order_id"]
				require.Equal(TypeString, property.Type)
			}
			if assert.Contains(typ.Properties.Map(), "creation_date") {
				property := typ.Properties.Map()["creation_date"]
				require.Equal(TypeString, property.Type)
			}
			if assert.Contains(typ.Properties.Map(), "items") {
				property := typ.Properties.Map()["items"]
				require.Equal("ProductItem[]", property.Type)
			}
		}
		if assert.Contains(use.Types, "Orders") {
			typ := use.Types["Orders"]
			require.Equal(TypeObject, typ.Type)
			if assert.Contains(typ.Properties.Map(), "orders") {
				property := typ.Properties.Map()["orders"]
				require.Equal("Order[]", property.Type)
			}
		}
		if assert.Contains(use.Traits, "paging") {
			trait := use.Traits["paging"]
			if assert.Contains(trait.QueryParameters.Map(), "size") {
				qp := trait.QueryParameters.Map()["size"]
				require.Equal("the amount of elements of each result page", qp.Description)
				require.Equal(TypeInteger, qp.Type)
				require.False(qp.Required)
				require.Equal(TypeInteger, qp.Example.Value.Type)
				require.EqualValues(10, qp.Example.Value.Integer)
			}
			if assert.Contains(trait.QueryParameters.Map(), "page") {
				qp := trait.QueryParameters.Map()["page"]
				require.Equal("the page number", qp.Description)
				require.Equal(TypeInteger, qp.Type)
				require.False(qp.Required)
				require.Equal(TypeInteger, qp.Example.Value.Type)
				require.EqualValues(0, qp.Example.Value.Integer)
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/orders") {
		resource := rootdoc.Resources["/orders"]
		require.Equal("Orders", resource.DisplayName)
		require.Equal("Orders collection resource used to create new orders.", resource.Description)
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Len(method.Is, 1) {
				is := method.Is[0]
				require.Equal("assets.paging", is.String)
			}
			require.Equal("lists all orders of a specific user", method.Description)
			if assert.Contains(method.QueryParameters.Map(), "userId") {
				qp := method.QueryParameters.Map()["userId"]
				require.Equal("string", qp.Type)
				require.Equal("use to query all orders of a user", qp.Description)
				require.True(qp.Required)
				require.Equal("1964401a-a8b3-40c1-b86e-d8b9f75b5842", qp.Example.Value.String)
			}
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("assets.Orders", body.Type)
					if assert.Contains(body.Examples, "single-order") {
						example := body.Examples["single-order"]
						if assert.Contains(example.Value.Map, "orders") {
							orders := example.Value.Map["orders"]
							if assert.Len(orders.Array, 1) {
								order := orders.Array[0]
								if assert.Contains(order.Map, "order_id") {
									orderID := order.Map["order_id"]
									require.Equal("ORDER-437563756", orderID.String)
								}
								if assert.Contains(order.Map, "creation_date") {
									creationDate := order.Map["creation_date"]
									require.Equal("2016-03-30", creationDate.String)
								}
								if assert.Contains(order.Map, "items") {
									items := order.Map["items"]
									if assert.Len(items.Array, 2) {
										item := items.Array[1]
										if assert.Contains(item.Map, "product_id") {
											productID := item.Map["product_id"]
											require.Equal("PRODUCT-2", productID.String)
										}
										if assert.Contains(item.Map, "quantity") {
											quantity := item.Map["quantity"]
											require.EqualValues(2, quantity.Integer)
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

func Test_ParseTypesystemSimple(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/typesystem/simple.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("API with Types", rootdoc.Title)
	if assert.Contains(rootdoc.Types, "User") {
		typ := rootdoc.Types["User"]
		require.Equal(TypeObject, typ.Type)
		if assert.Contains(typ.Properties.Map(), "age") {
			property := typ.Properties.Map()["age"]
			require.True(property.Required)
			require.Equal(TypeNumber, property.Type)
		}
		if assert.Contains(typ.Properties.Map(), "firstName") {
			property := typ.Properties.Map()["firstName"]
			require.True(property.Required)
			require.Equal(TypeString, property.Type)
		}
		if assert.Contains(typ.Properties.Map(), "lastName") {
			property := typ.Properties.Map()["lastName"]
			require.True(property.Required)
			require.Equal(TypeString, property.Type)
		}
	}
	if assert.Contains(rootdoc.Resources, "/users/{id}") {
		resource := rootdoc.Resources["/users/{id}"]
		require.Contains(resource.URIParameters, "id")
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("User", body.Type)
				}
			}
		}
	}
}

func Test_ParseAnnotationOnType(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/annotation-on-type.raml")
	require.NoError(err)

	if assert.Contains(rootdoc.AnnotationTypes, "AnnotationOnType") {
		annotationType := rootdoc.AnnotationTypes["AnnotationOnType"]
		require.Equal("annotation on type", annotationType.Description)
		require.Len(annotationType.AllowedTargets, 1)
		require.Equal(TargetLocationTypeDeclaration, annotationType.AllowedTargets[0])
		require.Equal(TypeString, annotationType.Type)
	}
	if assert.Contains(rootdoc.Types, "User") {
		apiType := rootdoc.Types["User"]
		if assert.Contains(apiType.Annotations, "AnnotationOnType") {
			annotation := apiType.Annotations["AnnotationOnType"]
			require.Equal("something on annotation", annotation.String)
			annotationType := annotation.AnnotationType
			require.Equal("annotation on type", annotationType.Description)
			require.Len(annotationType.AllowedTargets, 1)
			require.Equal(TargetLocationTypeDeclaration, annotationType.AllowedTargets[0])
			require.Equal(TypeString, annotationType.Type)
		}
	}
	if assert.Contains(rootdoc.Resources, "/user") {
		resource := rootdoc.Resources["/user"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Bodies, "application/json") {
				body := method.Bodies["application/json"]
				require.Equal("User", body.Type)
				if assert.Contains(body.Annotations, "AnnotationOnType") {
					annotation := body.Annotations["AnnotationOnType"]
					require.Equal("something on annotation", annotation.String)
					annotationType := annotation.AnnotationType
					require.Equal("annotation on type", annotationType.Description)
					require.Len(annotationType.AllowedTargets, 1)
					require.Equal(TargetLocationTypeDeclaration, annotationType.AllowedTargets[0])
					require.Equal(TypeString, annotationType.Type)
				}
			}
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[HTTPCode(200)]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("User", body.Type)
					if assert.Contains(body.Annotations, "AnnotationOnType") {
						annotation := body.Annotations["AnnotationOnType"]
						require.Equal("something on annotation", annotation.String)
						annotationType := annotation.AnnotationType
						require.Equal("annotation on type", annotationType.Description)
						require.Len(annotationType.AllowedTargets, 1)
						require.Equal(TargetLocationTypeDeclaration, annotationType.AllowedTargets[0])
						require.Equal(TypeString, annotationType.Type)
					}
				}
			}
		}
	}
}

func Test_ParseBaseURIParameters(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/base-uri-parameters.raml")
	require.NoError(err)

	require.Equal("Amazon S3 REST API", rootdoc.Title)
	require.Equal("1", rootdoc.Version)
	require.Equal("https://{bucketName}.s3.amazonaws.com", rootdoc.BaseURI)
	if assert.NotNil(rootdoc.BaseURIParameters) {
		if uriParam := rootdoc.BaseURIParameters["bucketName"]; assert.NotNil(uriParam) {
			require.Equal("The name of the bucket", uriParam.Description)
		}
	}
}

func Test_ParseCheckUnusedAnnotation(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	_, err := parser.ParseFile("./test-examples/check-unused-annotation.raml")
	require.Error(err)

	err = parser.Config(parserConfig.IgnoreUnusedAnnotation, true)
	require.NoError(err)

	rootdoc, err := parser.ParseFile("./test-examples/check-unused-annotation.raml")
	require.NoError(err)

	if assert.Contains(rootdoc.Resources, "/get") {
		resource := rootdoc.Resources["/get"]
		if assert.Contains(resource.Annotations, "UsedAnnotation") {
			annotation := resource.Annotations["UsedAnnotation"]
			require.Equal("used annotation", annotation.AnnotationType.Description)
		}
	}
}

func Test_ParseCheckUnusedTrait(t *testing.T) {
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	_, err := parser.ParseFile("./test-examples/check-unused-trait.raml")
	require.Error(err)

	err = parser.Config(parserConfig.IgnoreUnusedTrait, true)
	require.NoError(err)

	_, err = parser.ParseFile("./test-examples/check-unused-trait.raml")
	require.NoError(err)
}

func Test_ParseDefaultMediaType(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/default-mediaType.raml")
	require.NoError(err)
	if assert.Contains(rootdoc.Resources, "/user") {
		resource := rootdoc.Resources["/user"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[HTTPCode(200)]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal(TypeObject, body.Example.Value.Type)
					if assert.Contains(body.Example.Value.Map, "name") {
						name := body.Example.Value.Map["name"]
						require.Equal(TypeString, name.Type)
						require.Equal("Alice", name.String)
					}
				}
			}
		}
	}
}

func Test_ParseExampleFromType(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/example-from-type.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Example from type", rootdoc.Title)
	if assert.Contains(rootdoc.Types, "User") {
		typ := rootdoc.Types["User"]
		require.Equal(TypeObject, typ.Type)
		if assert.Contains(typ.Properties.Map(), "name") {
			property := typ.Properties.Map()["name"]
			require.True(property.Required)
			require.Equal(TypeString, property.Type)
		}
		if assert.Contains(typ.Properties.Map(), "email") {
			property := typ.Properties.Map()["email"]
			require.True(property.Required)
			require.Equal(TypeString, property.Type)
		}
		if assert.Contains(typ.Examples, "user1") {
			example := typ.Examples["user1"]
			if assert.Contains(example.Value.Map, "name") {
				value := example.Value.Map["name"]
				require.Equal("Alice", value.String)
			}
			if assert.Contains(example.Value.Map, "email") {
				value := example.Value.Map["email"]
				require.Equal("alice@example.com", value.String)
			}
		}
		if assert.Contains(typ.Examples, "user2") {
			example := typ.Examples["user2"]
			if assert.Contains(example.Value.Map, "name") {
				value := example.Value.Map["name"]
				require.Equal("Bob", value.String)
			}
			if assert.Contains(example.Value.Map, "email") {
				value := example.Value.Map["email"]
				require.Equal("bob@example.com", value.String)
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/user") {
		resource := rootdoc.Resources["/user"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("User", body.Type)
					if assert.Contains(body.Example.Value.Map, "name") {
						value := body.Example.Value.Map["name"]
						require.NotEmpty(value.String)
					}
				}
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/user/wrap") {
		resource := rootdoc.Resources["/user/wrap"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal(TypeObject, body.Type)
					if assert.Contains(body.Properties.Map(), "user") {
						property := body.Properties.Map()["user"]
						require.Equal("User", property.Type)
					}
					if assert.Contains(body.Example.Value.Map, "user") {
						user := body.Example.Value.Map["user"]
						if assert.Contains(user.Map, "name") {
							value := user.Map["name"]
							require.Equal(TypeString, value.Type)
							require.NotEmpty(value.String)
						}
						if assert.Contains(user.Map, "email") {
							value := user.Map["email"]
							require.Equal(TypeString, value.Type)
							require.NotEmpty(value.String)
						}
					}
					if assert.Contains(body.Examples, "autoGenerated") {
						example := body.Examples["autoGenerated"]
						if assert.Contains(example.Value.Map, "user") {
							user := body.Example.Value.Map["user"]
							if assert.Contains(user.Map, "name") {
								value := user.Map["name"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
							if assert.Contains(user.Map, "email") {
								value := user.Map["email"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
						}
					}
				}
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/users") {
		resource := rootdoc.Resources["/users"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal("User[]", body.Type)
					require.Len(body.Example.Value.Array, 2)
					for _, user := range body.Example.Value.Array {
						require.NotNil(user)
						if assert.Contains(user.Map, "name") {
							value := user.Map["name"]
							require.Equal(TypeString, value.Type)
							require.NotEmpty(value.String)
						}
						if assert.Contains(user.Map, "email") {
							value := user.Map["email"]
							require.Equal(TypeString, value.Type)
							require.NotEmpty(value.String)
						}
					}
					if assert.Contains(body.Examples, "autoGenerated") {
						example := body.Examples["autoGenerated"]
						require.Len(example.Value.Array, 2)
						for _, user := range example.Value.Array {
							require.NotNil(user)
							if assert.Contains(user.Map, "name") {
								value := user.Map["name"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
							if assert.Contains(user.Map, "email") {
								value := user.Map["email"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
						}
					}
				}
			}
		}
	}
	if assert.Contains(rootdoc.Resources, "/users/wrap") {
		resource := rootdoc.Resources["/users/wrap"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "application/json") {
					body := response.Bodies["application/json"]
					require.Equal(TypeObject, body.Type)
					if assert.Contains(body.Properties.Map(), "users") {
						property := body.Properties.Map()["users"]
						require.Equal("User[]", property.Type)
					}
					if assert.Contains(body.Example.Value.Map, "users") {
						users := body.Example.Value.Map["users"]
						require.Len(users.Array, 2)
						for _, user := range users.Array {
							require.NotNil(user)
							if assert.Contains(user.Map, "name") {
								value := user.Map["name"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
							if assert.Contains(user.Map, "email") {
								value := user.Map["email"]
								require.Equal(TypeString, value.Type)
								require.NotEmpty(value.String)
							}
						}
					}
				}
			}
		}
	}
}

func Test_ParseExampleIncludeBinaryFile(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/example-include-binary-file.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	require.Equal("Example include binary file", rootdoc.Title)
	if assert.Contains(rootdoc.Resources, "/binary") {
		resource := rootdoc.Resources["/binary"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Contains(method.Responses, HTTPCode(200)) {
				response := method.Responses[200]
				if assert.Contains(response.Bodies, "image/png") {
					body := response.Bodies["image/png"]
					require.Equal(TypeFile, body.Type)
					require.Len(body.FileTypes, 1)
					require.Equal("*/*", body.FileTypes[0])
					require.Equal(TypeBinary, body.Example.Value.Type)
					require.Len(body.Example.Value.Binary, 14865)
				}
			}
		}
	}
}

func Test_ParseObjectArray(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/object-array.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	if assert.Contains(rootdoc.Types, "UserList") {
		apiType := rootdoc.Types["UserList"]
		require.Equal("object[]", apiType.Type)
		if assert.Contains(apiType.Properties.Map(), "name") {
			property := apiType.Properties.Map()["name"]
			require.Equal(TypeString, property.Type)
		}
		if assert.Len(apiType.Example.Value.Array, 2) {
			require.Contains(apiType.Example.Value.Array[0].Map, "name")
			require.Equal("Alice", apiType.Example.Value.Array[0].Map["name"].String)
			require.Contains(apiType.Example.Value.Array[1].Map, "name")
			require.Equal("Bob", apiType.Example.Value.Array[1].Map["name"].String)
		}
	}
}

func Test_ParseTrait(t *testing.T) {
	assert := assert.New(t)
	assert.NotNil(assert)
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./test-examples/trait.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	if assert.Contains(rootdoc.Traits, "RequireLogin") {
		trait := rootdoc.Traits["RequireLogin"]
		if assert.Contains(trait.Headers.Map(), "Authorization") {
			header := trait.Headers.Map()["Authorization"]
			require.Equal(TypeString, header.Type)
		}
	}
	if assert.Contains(rootdoc.Resources, "/user") {
		resource := rootdoc.Resources["/user"]
		if assert.Contains(resource.Methods, "get") {
			method := resource.Methods["get"]
			if assert.Len(method.Is, 1) {
				trait := method.Is[0]
				require.Equal(trait.String, "RequireLogin")
				if assert.Contains(trait.Headers.Map(), "Authorization") {
					header := trait.Headers.Map()["Authorization"]
					require.Equal(TypeString, header.Type)
				}
			}
		}
	}
}

func Test_GobEncodeDecode(t *testing.T) {
	require := require.New(t)
	require.NotNil(require)

	parser := NewParser()
	require.NotNil(parser)

	rootdoc, err := parser.ParseFile("./raml-examples/others/mobile-order-api/api.raml")
	require.NoError(err)
	require.NotZero(rootdoc)

	buffer := &bytes.Buffer{}
	enc := gob.NewEncoder(buffer)
	dec := gob.NewDecoder(buffer)

	err = enc.Encode(rootdoc)
	require.NoError(err)
	var decodedDoc RootDocument
	err = dec.Decode(&decodedDoc)
	require.NoError(err)

	srcjson, err := jsonex.MarshalIndent(rootdoc, "", "  ")
	require.NoError(err)
	dstjson, err := jsonex.MarshalIndent(decodedDoc, "", "  ")
	require.NoError(err)
	requireutil.RequireText(t, string(srcjson), string(dstjson))
}
