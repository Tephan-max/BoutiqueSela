const Producto = require('../models/Producto');
const { obtenerIo } = require('../socket')

class ProductoController {
    async obtener(req, res) {
        try {
            const productos = await Producto.find()
            res.status(200).json({ data: productos })
        } catch (e) {
            res.status(500).send()
        }
    }
    async agregar(req, res) {
        try {
            const producto = await Producto.create(req.body)
            obtenerIo().emit('actualizacionProductos', {
                tipo: 'insert',
                documento: producto
            })
            res.status(201).json({ documento: producto })
        } catch (err) {
            res.status(400).json({ mensaje: err.message })
        }
    }
    async actualizar(req, res) {
        const { id } = req.params
        try {
            const producto = await Producto.findByIdAndUpdate(
                id,
                req.body,
                { new: true }
            );

            if (!producto) {
                return res.status(404).json({
                    mensaje: 'No se encontró el id'
                });
            }

            obtenerIo().emit('actualizacionProductos', {
                tipo: 'update',
                documento: producto
            })

            res.status(201).json({ documento: producto })

        } catch (err) {
            res.status(400).json({ mensaje: err.message })
        }
    }
    async eliminar(req, res) {
        const { id } = req.params

        try {
            const producto = await Producto.findById(id)

            if (producto == null) {
                return res.status(404).json({ mensaje: 'No se encontro id' })

            }

            await producto.deleteOne()

            obtenerIo().emit('actualizacionProductos', {
                tipo: 'delete',
                documento: producto
            })

            res.status(200).send()

        } catch (err) {
            res.status(500).send()
        }
    }
}

module.exports = new ProductoController()