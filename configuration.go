package main

import (
	"encoding/json"
	"io/ioutil"
)

type Configuration struct {
	Port       int    `json:"port"`
	Root       string `json:"root"`
	RamlSuffix string `json:"raml_suffix"`
}

func (c *Configuration) Save() error {
	file, err := json.Marshal(c)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile("./conf.json", file, 0644)
	return err
}

func NewBasicConfiguration() Configuration {
	return Configuration{Root: ".", Port: 3000, RamlSuffix: "raml"}
}

func NewConfiguration(root, ramlSuffix string, port int) Configuration {
	return Configuration{Root: root, RamlSuffix: ramlSuffix, Port: port}
}

func ReadConfiguration() (Configuration, error) {
	file, err := ioutil.ReadFile("conf.json")
	if err != nil {
		return Configuration{}, err
	}
	var conf Configuration
	err = json.Unmarshal(file, &conf)
	return conf, err
}
