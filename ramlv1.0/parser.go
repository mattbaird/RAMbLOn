package model

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path/filepath"
	"reflect"

	"github.com/mattbaird/RAMbLOn/ramlv1.0/parserConfig"
	"github.com/tsaikd/KDGoLib/errutil"
	"github.com/tsaikd/KDGoLib/futil"
	"github.com/tsaikd/yaml"
)

// overall parser strategy is to dereference all includes
// and then create the model, rather than the complexity of the
// recursive post-processing

// NewParser create Parser instance
func NewParser() Parser {
	parser := &parserImpl{
		errorTraceDistance: 4,
	}
	return parser
}

// Parser used to parse raml file
type Parser interface {
	// Config Parser to change the behavior of parsing
	Config(config parserConfig.Enum, value interface{}) (err error)

	// Get Parser Config
	Get(config parserConfig.Enum) (value interface{}, err error)

	// ParseFile Parse a RAML file.
	// Return RootDocument or an error if something went wrong.
	ParseFile(filePath string) (rootdoc RootDocument, err error)

	// ParseFile Parse RAML from bynary data.
	// Return RootDocument or an error if something went wrong.
	ParseData(data []byte, workdir string) (rootdoc RootDocument, err error)
}

type parserImpl struct {
	cacheDirectory         string
	checkRAMLVersion       bool
	checkValueOptions      []CheckValueOption
	errorTraceDistance     int64
	ignoreUnusedAnnotation bool
	ignoreUnusedTrait      bool
}

func (t *parserImpl) Config(config parserConfig.Enum, value interface{}) (err error) {
	var field interface{}
	switch config {
	case parserConfig.CacheDirectory:
		field = &t.cacheDirectory
	case parserConfig.CheckRAMLVersion:
		field = &t.checkRAMLVersion
	case parserConfig.CheckValueOptions:
		field = &t.checkValueOptions
	case parserConfig.ErrorTraceDistance:
		field = &t.errorTraceDistance
	case parserConfig.IgnoreUnusedAnnotation:
		field = &t.ignoreUnusedAnnotation
	case parserConfig.IgnoreUnusedTrait:
		field = &t.ignoreUnusedTrait
	default:
		return ErrorUnsupportedParserConfig1.New(nil, config)
	}
	if err = parserConfigSet(field, value); err != nil {
		switch errutil.FactoryOf(err) {
		case ErrorInvalidParserConfigValueType2:
			return ErrorInvalidParserConfigValueType3.New(nil, config, field, value)
		default:
			return err
		}
	}
	return nil
}

func (t *parserImpl) Get(config parserConfig.Enum) (value interface{}, err error) {
	switch config {
	case parserConfig.CheckRAMLVersion:
		return t.checkRAMLVersion, nil
	case parserConfig.CheckValueOptions:
		return t.checkValueOptions, nil
	case parserConfig.ErrorTraceDistance:
		return t.errorTraceDistance, nil
	case parserConfig.IgnoreUnusedAnnotation:
		return t.ignoreUnusedAnnotation, nil
	case parserConfig.IgnoreUnusedTrait:
		return t.ignoreUnusedTrait, nil
	default:
		return nil, ErrorUnsupportedParserConfig1.New(nil, config)
	}
}

func (t parserImpl) ParseFile(filePath string) (rootdoc RootDocument, err error) {
	var workdir string
	var fileData []byte

	// load the RAML with the !include directives
	if futil.IsDir(filePath) {
		workdir = filePath
		if fileData, err = LoadRAMLFromDir(filePath); err != nil {
			return
		}
	} else {
		workdir = filepath.Dir(filePath)
		if fileData, err = ioutil.ReadFile(filePath); err != nil {
			return
		}
	}

	if t.cacheDirectory != "" {
		var saveFunc func(RootDocument)
		if saveFunc, rootdoc, err = loadFromCache(filePath, fileData, t.cacheDirectory); err == nil {
			return
		}
		if saveFunc != nil {
			defer func() {
				// only cache when parsing success
				if err == nil {
					saveFunc(rootdoc)
				}
			}()
		}
	}

	return t.ParseData(fileData, workdir)
}

func (t parserImpl) ParseData(data []byte, workdir string) (rootdoc RootDocument, err error) {
	rootdoc.WorkingDirectory = workdir

	if t.checkRAMLVersion {
		if err = checkRAMLVersion(data); err != nil {
			return
		}
	}

	if err = yaml.Unmarshal(data, &rootdoc); err != nil {
		line, _, ok := ParseYAMLError(err)
		if !ok || t.errorTraceDistance < 0 {
			return rootdoc, ErrorYAMLParseFailed.New(err)
		}

		extraInfo := GetLinesInRange(string(data), "\n", line+1, t.errorTraceDistance)
		return rootdoc, ErrorYAMLParseFailed1.New(err, extraInfo)
	}

	rootdoc, err = t.ResolveIncludes(rootdoc)
	rootdoc.Resources.FillURIParams()
	return
}

func (t *parserImpl) ResolveIncludes(doc RootDocument) (rootdoc RootDocument, err error) {
	if doc.Types.includeTag {
		fpath := filepath.Join(doc.WorkingDirectory, doc.Types.Value.String)
		fmt.Printf("fillTypes includeTag:%v\n", fpath)
		var fdata []byte
		fdata, err = ioutil.ReadFile(fpath)
		if err == nil {
			// unmarshal the types
			// MBAIRD: this is wrong,
			fmt.Printf("***************** unmarshaling\n")
			//			doc.Types.MapAPITypes = MapAPITypes{}
			err = yaml.Unmarshal(fdata, &doc.Types)
			if err != nil {
				fmt.Printf("error unmarshalling:%v\n", err)
			}

		} else {
			fmt.Printf("Error:%v\n", err)
		}

	}
	return doc, err
}

func parserConfigSet(field interface{}, value interface{}) (err error) {
	f := reflect.ValueOf(field)
	v := reflect.ValueOf(value)
	defer func() {
		if perr := recover(); perr != nil {
			err = ErrorInvalidParserConfigValueType2.New(nil, f.Elem().Interface(), value)
		}
	}()
	f.Elem().Set(v)
	return
}

func checkRAMLVersion(data []byte) (err error) {
	buffer := bytes.NewBuffer(data)
	firstLine, err := buffer.ReadString('\n')
	if err != nil {
		return
	}
	if firstLine[:10] != "#%RAML 1.0" {
		return ErrorUnexpectedRAMLVersion2.New(nil, "#%RAML 1.0", firstLine[:10])
	}
	return nil
}
