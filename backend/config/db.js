const mongoose = require('mongoose')

const conectarDb = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL)
        console.log('MongoDB conectado')
    } catch (err) {
        console.log('Error al conectar MongoDB:', err.message)
    }
}

module.exports = conectarDb