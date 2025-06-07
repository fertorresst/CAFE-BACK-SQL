const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * Middleware de autenticación de usuarios que verifica el token JWT en las cookies.
 */
function userAuthMiddleware(req, res, next) {
  const token = req.cookies.user_token
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

module.exports = { userAuthMiddleware }