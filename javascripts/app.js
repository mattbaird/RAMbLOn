import "jquery-ui"
import "toc"
import "search"
import Project from "project"

$(() => {
  const { directory, name, clientUUID } = window.project
  var project = new Project(directory, name, clientUUID)
  project.listen()
})
