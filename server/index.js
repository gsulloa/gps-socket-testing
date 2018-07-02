const http = require('http')
const socket = require('socket.io')

const server = http.createServer()

const io = new socket(server)

io.on('connection', (socket) => {
	console.log('conection!')
	socket.on('new location', data => {
		console.log(`client ${socket.id} send data: ${JSON.stringify(data, null, 2)}`)
	})
	socket.on('disconnect', () => {
		console.log(`client ${socket.id} disconnected`)
	})
})

server.listen(3000, () => console.log('listening on port 3000'))

