# RAMbLOn

A Go (golang) Interactive RAML v1.0 API to HTML converter.

I started using [API Workbench](http://apiworkbench.com/) to edit [RAML 1.0](http://www.raml.org/blogs/raml-10-here) documents and found there was no great way to generate API documentation.

API Workbench is a great editing tool, what I really wanted was an interactive RAML-->HTML converter that picked up changes as I made them.

I also wanted a more theme-able approach to the documentation generation.

So I built RamblOn using Go for ease of installation (single binary), [Martini](https://github.com/go-martini/martini) and a fork of [go-raml-parser](https://github.com/tsaikd/go-raml-parser).

You can run the web server for interactive RAML visualization. The server will watch the RAML directories and use websockets to reload the pages that have changed (or just have docs gen'd on demand, or you can run it as a command line program to generate final documentation.

This project is pretty early, and there is a bunch of work left to do:

1. RAML v1.0 spec completion
2. RAML v1.0 validation
3. SASS setup
4. Websockets update notification
5. Improved CSS
6. Documentation Generation Mode

My approach to RAML Includes has been to first generate the complete document by dereferencing the includes instead of what @tsaikd did with the yaml post processing.

Pull Requests are encouraged, thanks in advance.
