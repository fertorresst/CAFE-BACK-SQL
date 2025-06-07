const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * Middleware de autenticación de admins que verifica el token JWT en las cookies.
 */
function adminAuthMiddleware(req, res, next) {
  const token = req.cookies.admin_token
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

module.exports = { adminAuthMiddleware }