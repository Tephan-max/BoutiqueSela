const iniciarServidor = async (app) => {
    const conectarDb = require('./config/db');
    const http = require('http');
    const server = http.createServer(app);
    const { inicializarIo } = require('./socket')
    inicializarIo(server)

    try {
        await conectarDb();

        const PORT = process.env.PORT || 3000;

        server.listen(PORT, () => {
            console.log('Servidor corriendo en http://localhost:3000');
        });
    }
    catch (error) {
        console.error('Error crítico al iniciar la aplicación:', error);
    }
}

module.exports = iniciarServidor