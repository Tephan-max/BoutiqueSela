const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
    const authorization = req.headers.authorization

    try{
        const token = authorization.split(' ')[1]
        jwt.verify(token, process.env.CLAVE)
        next()
    }catch(e){
        res.status(401).send()
    }
}

const generarToken = () => {
    const token = jwt.sign({}, process.env.CLAVE)
    return token
}

module.exports = {
    verificarToken,
    generarToken
}