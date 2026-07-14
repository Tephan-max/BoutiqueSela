const { Server } = require('socket.io');

let io

const inicializarIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: "https://boutiquesela-1.onrender.com"
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