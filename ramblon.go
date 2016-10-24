package main

import (
	"fmt"
	"github.com/beatrichartz/martini-sockets"
	"github.com/go-martini/martini"
	"github.com/howeyc/fsnotify"
	"github.com/kr/pretty"
	"github.com/martini-contrib/render"
	"github.com/satori/go.uuid"
	"github.com/tsaikd/KDGoLib/jsonex"
	"html/template"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	parser "github.com/mattbaird/RAMbLOn/ramlv1.0"
	"github.com/mattbaird/RAMbLOn/ramlv1.0/parserConfig"
)

var projects *Projects = newProjects()
var watchers map[string]*fsnotify.Watcher = make(map[string]*fsnotify.Watcher)

func main() {
	m := martini.Classic()
	m.Use(martini.Static("public")) // serve from the "static" directory
	var templateFuncs map[string]interface{} = make(map[string]interface{})
	templateFuncs["safe"] = func(s string) template.HTML { return template.HTML(s) }
	templateFuncs["underscore"] = func(s string) string {
		return strings.Replace(s, " ", "_", -1)
	}
	templateFuncs["uriParameterHighlight"] = func(s string) string {
		log.Printf("replacing %s\n", s)
		if len(s) > 0 {
			temp := s
			var params = regexp.MustCompile(`\{([^}]+)\}`)
			replace := params.FindAllString(s, -1)
			for _, r := range replace {
				temp = strings.Replace(temp, r, fmt.Sprintf("<b>%s</b>", r), -1)
			}
			log.Printf("replaced %s\n", temp)
			return temp
		} else {
			return s
		}
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
		log.Printf("parsing:%v\n", ramlFile)
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
			log.Printf("json:%v\n", string(jsonBytes))
		}
		r.HTML(200, "index", rootdoc)
	})

	m.Get("/browse", func(r render.Render, params martini.Params) {
		files, err := ioutil.ReadDir("./ramlv1.0/raml-examples/")
		if err != nil {
			log.Printf("error:%v\n", err)
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
			log.Printf("error:%v\n", err)
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

	m.NotFound(func(r render.Render) {
		r.HTML(404, "404", nil)
	})

	m.Get("/api/:directory/:name", func(r render.Render, params martini.Params) {
		directory := params["directory"]
		name := params["name"]
		fullDirectory, err := getDirectory(directory)
		if err != nil {
			pretty.Printf("error during PWD lookup:%v\n", err)
			r.HTML(500, "500", err)
			return
		}
		ramlFile := fmt.Sprintf("%s%s", fullDirectory, name)
		log.Printf("file is:%s\n", ramlFile)
		project := Project{directory: fullDirectory}
		projects.projects = append(projects.projects, &project)
		err = watch(fullDirectory, name)
		if err != nil {
			pretty.Printf("error during File Watch:%v\n", err)
			r.HTML(500, "500", err)
			return
		}
		var checkRAMLVersion bool
		var allowIntToBeNum bool
		var checkOptions = []parser.CheckValueOption{}

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
			log.Printf("json:%v\n", string(jsonBytes))
		}
		u1 := uuid.NewV4()
		clientUUID := u1.String()
		r.HTML(200, "index", map[string]interface{}{
			"directory":  directory,
			"name":       name,
			"raml":       rootdoc,
			"clientUUID": clientUUID})
	})

	// This is the sockets connection for the project, it is a json mapping to sockets.
	m.Get("/sockets/projects/:directory/:project/:clientUUID", sockets.JSON(Message{}), func(params martini.Params,
		receiver <-chan *Message, sender chan<- *Message, done <-chan bool, disconnect chan<- int, err <-chan error) (int, string) {
		log.Printf("**** called\n")
		client := &Client{params["clientUUID"], receiver, sender, done, err, disconnect}
		directory, e := getDirectory(params["directory"])
		if e != nil {
			pretty.Printf("error during File Watch:%v\n", err)
			return 500, e.Error()
		}
		projects := projects.getProject(directory)
		projects.appendClient(client)

		// A single select can be used to do all the messaging
		for {
			select {
			case <-client.err:
				// Don't try to do this:
				// client.out <- &Message{"system", "system", "There has been an error with your connection"}
				// The socket connection is already long gone.
				// Use the error for statistics etc
			case msg := <-client.in:
				log.Printf("client message:%v\n", msg)
			case <-client.done:
				projects.removeClient(client)
				return 200, "OK"
			}
		}
	})

	m.Run()
}

func getDirectory(directory string) (string, error) {
	rootDir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		return "", err
	}
	fulldir := fmt.Sprintf("%s/ramlv1.0/raml-examples/%s/", rootDir, directory)
	return fulldir, nil
}

func watch(directory, project string) error {
	var mutex = &sync.Mutex{}
	mutex.Lock()
	defer mutex.Unlock()
	dirAndProject := fmt.Sprintf("%s%s", directory, project)
	// don't double watch
	if _, ok := watchers[dirAndProject]; ok {
		log.Printf("dir [%s] already being watched\n", dirAndProject)
		return nil
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return err
	}
	// Process events
	lastEventAt := time.Now()
	var event *fsnotify.FileEvent = &fsnotify.FileEvent{}
	go func() {
		for {
			select {
			case ev := <-watcher.Event:

				sameEvent := ev.Name == event.Name
				recent := time.Since(lastEventAt) < 2*time.Second
				notifyClients := false
				switch sameEvent {
				case true:
					if !recent {
						notifyClients = true
					}
				case false:
					notifyClients = true
				}
				if notifyClients {
					log.Printf("Notifying\n")
					lastEventAt = time.Now()
					event = ev
					for _, project := range projects.projects {
						if project.directory == directory {
							project.messageClients(NewMessage("update", dirAndProject, "updated"))
						}
					}
				}
			case err := <-watcher.Error:
				log.Printf("error:%v\n", err)
			}
		}
	}()
	err = watcher.Watch(dirAndProject)
	if err != nil {
		log.Printf("error:%v\n", err)
		return err
	}
	proj := projects.getProject(dirAndProject)
	if proj != nil {
		proj.messageClients(NewMessage("confirmation", "system", fmt.Sprintf("watching %s", dirAndProject)))
	}
	log.Printf("[%s] being watched\n", dirAndProject)
	watchers[directory] = watcher
	return nil
}

func shutdownWatchers() {
	for _, watcher := range watchers {
		watcher.Close()
	}

}

type Projects struct {
	sync.Mutex
	projects []*Project
}

type Project struct {
	sync.Mutex
	directory string
	clients   []*Client
}

type Client struct {
	Name       string
	in         <-chan *Message
	out        chan<- *Message
	done       <-chan bool
	err        <-chan error
	disconnect chan<- int
}

func newProjects() *Projects {
	return &Projects{sync.Mutex{}, make([]*Project, 0)}
}

// A simple Message struct
type Message struct {
	Typ  string `json:"typ"`
	From string `json:"from"`
	Text string `json:"text"`
}

func NewMessage(t, f, text string) *Message {
	return &Message{Typ: t, From: f, Text: text}
}

// Get the project for the given directory
func (p *Projects) getProject(directory string) *Project {
	p.Lock()
	defer p.Unlock()
	for _, project := range p.projects {
		if project.directory == directory {
			return project
		}
	}
	r := &Project{sync.Mutex{}, directory, make([]*Client, 0)}
	p.projects = append(p.projects, r)
	return r
}

func (p *Project) appendClient(client *Client) {
	p.Lock()
	p.clients = append(p.clients, client)
	for _, c := range p.clients {
		if c != client {
			c.out <- &Message{"status", client.Name, "Is watching Project"}
		}
	}
	p.Unlock()
}

// Remove a client from a room
func (p *Project) removeClient(client *Client) {
	p.Lock()
	defer p.Unlock()

	for index, c := range p.clients {
		if c == client {
			p.clients = append(p.clients[:index], p.clients[(index+1):]...)
		} else {
			c.out <- &Message{"status", client.Name, "Is not watching Project"}
		}
	}
}

// Message all clients watching the project
func (p *Project) messageClients(msg *Message) {
	p.Lock()
	for _, c := range p.clients {
		c.out <- msg
	}
	defer p.Unlock()
}

// currently unused
func websocketOptions() *sockets.Options {
	// websockets stuff
	return &sockets.Options{
		// The logger to use for socket logging
		Logger: log.New(os.Stdout, "[sockets] ", 0), // *log.Logger

		// The LogLevel for socket logging, possible values:
		// sockets.LogLevelError (0)
		// sockets.LogLevelWarning (1)
		// sockets.LogLevelInfo (2)
		// sockets.LogLevelDebug (3)

		LogLevel: sockets.LogLevelInfo, // int

		// Set to true if you want to skip logging
		SkipLogging: false, // bool

		// The time to wait between writes before timing out the connection
		// When this is a zero value time instance, write will never time out
		WriteWait: 60 * time.Second, // time.Duration

		// The time to wait at maximum between receiving pings from the client.
		PongWait: 60 * time.Second, // time.Duration

		// The time to wait between sending pings to the client
		// Attention, this does have to be shorter than PongWait and WriteWait
		// unless you want connections to constantly time out.
		PingPeriod: (60 * time.Second * 8 / 10), // time.Duration

		// The maximum messages size for receiving and sending in bytes
		// Messages bigger than this will lead to panic and disconnect
		MaxMessageSize: 65536, // int64

		// The send channel buffer
		// How many messages can be asynchronously held before the channel blocks
		SendChannelBuffer: 10, // int

		// The receiving channel buffer
		// How many messages can be asynchronously held before the channel blocks
		RecvChannelBuffer: 10, // int

		// The allowed origin
		// Must be compileable as regexp. {{host}} will be replaced with the current
		// request host if given.
		AllowedOrigin: "https?://{{host}}$", // string
	}

}
