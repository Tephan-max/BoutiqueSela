const { Server } = require('socket.io');

let io

const inicializarIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173"
        }
    })

    io.on('connection', () => {
        console.log('Un usuario se acaba de conectar')
    })
}

const obtenerIo = () => io

module.exports = {
    inicializarIo,
    obtenerIo
}