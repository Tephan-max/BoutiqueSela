const { Schema, model } = require('mongoose')

// Definimos un sub-esquema para las variantes de stock por talla
const varianteTallaSchema = new Schema({
    talla: { 
        type: String, 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true, 
        default: 0,
        min: 0 // Evita que por error guardes stock negativo
    }
}, { _id: false }) // '_id: false' evita que Mongoose le cree un ID propio a cada combinación de talla

const productoSchema = new Schema({
    categoria: String,
    marca: String,
    descripcion: String,
    imgs: [String],
    precio: Number,
    // 🔥 Aquí está el cambio clave: asociamos las tallas directamente con su stock
    inventario: [varianteTallaSchema]
})

module.exports = model('Producto', productoSchema)