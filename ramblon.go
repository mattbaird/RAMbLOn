package main

import (
	"fmt"
	"github.com/go-martini/martini"
	"github.com/kr/pretty"
	"github.com/martini-contrib/render"
	"github.com/tsaikd/KDGoLib/jsonex"
	"html/template"
	"io/ioutil"
	"os"
	"strings"

	parser "github.com/mattbaird/RAMbLOn/ramlv1.0"
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
		fmt.Printf("parsing:%v\n", ramlFile)
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
		if false {
			fmt.Printf("json:%v\n", string(jsonBytes))
		}
		r.HTML(200, "index", rootdoc)
	})
	m.Get("/browse", func(r render.Render, params martini.Params) {
		files, err := ioutil.ReadDir("./ramlv1.0/raml-examples/")
		if err != nil {
			fmt.Printf("error:%v\n", err)
		}
		var directories []os.FileInfo
		for _, file := range files {
			if file.IsDir() {
				directories = append(directories, file)
			}
		}
		r.HTML(200, "browse", directories)
	})

	m.Get("/browse/:directory", func(r render.Render, params martini.Params) {
		directory := params["directory"]
		files, err := ioutil.ReadDir(fmt.Sprintf("./ramlv1.0/raml-examples/%s", directory))
		if err != nil {
			fmt.Printf("error:%v\n", err)
		}
		var apis []os.FileInfo
		for _, file := range files {
			if !file.IsDir() {
				apis = append(apis, file)
			}
		}
		r.HTML(200, "browseapi", map[string]interface{}{
			"directory": directory,
			"apis":      apis})
	})

	m.Get("/api/:directory/:name", func(r render.Render, params martini.Params) {
		directory := params["directory"]
		name := params["name"]
		ramlFile := fmt.Sprintf("./ramlv1.0/raml-examples/%s/%s", directory, name)
		fmt.Printf("file is:%s\n", ramlFile)
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
		if false {
			fmt.Printf("json:%v\n", string(jsonBytes))
		}
		r.HTML(200, "index", map[string]interface{}{
			"directory": directory,
			"name":      name,
			"raml":      rootdoc})
	})
	m.Run()
}
