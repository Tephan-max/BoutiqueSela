const express = require('express')
const router = express.Router()
const ProductoController = require('../controller/ProductoController')
const {verificarToken, generarToken} = require('../funcionesJwt')

router.post('/login', (req, res) => {
    const { clave } = req.body

    if(clave != process.env.CLAVE){
        return res.status(401).send()
    }

    res.status(200).json({token: generarToken()})
})

router.get('/productos', ProductoController.obtener)
router.post('/productos', verificarToken, ProductoController.agregar)
router.put('/productos/:id', verificarToken, ProductoController.actualizar)
router.delete('/productos/:id', verificarToken, ProductoController.eliminar)

module.exports = router