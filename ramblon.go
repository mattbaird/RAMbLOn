package main

import (
	"fmt"
	"github.com/go-martini/martini"
	"github.com/kr/pretty"
	"github.com/martini-contrib/render"
	"github.com/tsaikd/KDGoLib/jsonex"
	"html/template"
	"strings"

	parser "github.com/mattbaird/RAMbLOn/ramlv1.0/model"
	"github.com/mattbaird/RAMbLOn/ramlv1.0/parserConfig"
)

func main() {
	m := martini.Classic()
	m.Use(martini.Static("public")) // serve from the "static" directory
	var templateFuncs map[string]interface{} = make(map[string]interface{})
	templateFuncs["safe"] = func(s string) template.HTML { return template.HTML(s) }
	templateFuncs["underscore"] = func(s string) string {
		return strings.Replace(s, " ", "_", -1)
	}
	m.Use(render.Renderer(render.Options{
		Directory: "templates", // Specify what path to load the templates from.
		//		Layout:          "layout",                       // Specify a layout template. Layouts can call {{ yield }} to render the current template.
		Extensions:      []string{".tmpl"},                 // Specify extensions to load for templates.
		Funcs:           []template.FuncMap{templateFuncs}, // Specify helper function maps for templates to access.
		Delims:          render.Delims{"{{", "}}"},         // Sets delimiters to the specified strings.
		Charset:         "UTF-8",                           // Sets encoding for json and html content-types. Default is "UTF-8".
		IndentJSON:      true,                              // Output human readable JSON
		IndentXML:       true,                              // Output human readable XML
		HTMLContentType: "text/html",                       // Output XHTML content type instead of default "text/html"
	}))
	m.Get("/", func(r render.Render) {
		ramlFile := "/home/matthew/code/go/src/github.com/AtScaleInc/modeler/api-docs/api.raml"
		var checkRAMLVersion bool
		var allowIntToBeNum bool
		var checkOptions = []parser.CheckValueOption{}
		var err error

		ramlParser := parser.NewParser()

		if allowIntToBeNum {
			checkOptions = append(checkOptions, parser.CheckValueOptionAllowIntegerToBeNumber(true))
		}

		if err = ramlParser.Config(parserConfig.CheckRAMLVersion, checkRAMLVersion); err != nil {
			pretty.Printf("error during config[CheckRAMLVersion]:%v", err)
			r.HTML(500, "500", err)
			return
		}

		if err = ramlParser.Config(parserConfig.CheckValueOptions, checkOptions); err != nil {
			pretty.Printf("error during config[CheckValueOptions]:%v", err)
			r.HTML(500, "500", err)
			return
		}

		rootdoc, err := ramlParser.ParseFile(ramlFile)
		if err != nil {
			pretty.Printf("error during ParseFile:%v", err)
			r.HTML(500, "500", err)
			return
		}

		jsonBytes, err := jsonex.MarshalIndent(rootdoc, "", "  ")
		if err != nil {
			pretty.Printf("error during MarshalIndent:%v", err)
			r.HTML(500, "500", err)
			return
		}
		fmt.Printf("json:%v\n", string(jsonBytes))
		r.HTML(200, "index", rootdoc)
	})
	m.Run()
}
