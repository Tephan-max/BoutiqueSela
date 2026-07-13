const { Schema, model } = require('mongoose')

const productoSchema = new Schema({
    categoria: String,
    marca: String,
    talla: String,
    imgs: [String],
    precio: Number
})

module.exports = model('Producto', productoSchema)