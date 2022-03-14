// `http` is a standard library
// built into node.
import { createServer } from 'http'
import Gun from 'gun'

// Create a new server instance.
var server = createServer()

// Our GUN setup from the last example.
var gun = Gun({ web: server })

// Start the server on port 8080.
server.listen(8080, function () {
  console.log('Server listening on http://localhost:8080/gun')
})
