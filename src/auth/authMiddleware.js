const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * Middleware para autenticar tokens JWT en las rutas protegidas.
 * El token debe enviarse en el header 'Authorization' con el formato: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  // Obtener el header de autorización
  const authHeader = req.headers['authorization']

  // Validar que el header exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'TOKEN DE AUTORIZACIÓN NO PROPORCIONADO O MAL FORMADO',
      success: false
    })
  }

  // Extraer el token
  const token = authHeader.split(' ')[1]

  // Verificar el token usando la clave secreta
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'TOKEN INVÁLIDO O EXPIRADO',
        success: false
      })
    }
    // Adjuntar la información del usuario al request para su uso posterior
    req.user = user
    next()
  })
}

/**
 * Middleware de autenticación que verifica el token JWT en las cookies.
 */
function authMiddleware(req, res, next) {
  const token = req.cookies.token
  console.log("🚀 ~ authMiddleware ~ token:", token)
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

module.exports = { authenticateToken, authMiddleware }