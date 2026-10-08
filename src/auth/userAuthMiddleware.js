const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
require('dotenv').config()

/**
 * Middleware de autenticación de usuarios que verifica el token JWT en las cookies.
 * También valida que el usuario autenticado siga existiendo.
 */
async function userAuthMiddleware(req, res, next) {
  const token = req.cookies.user_token
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.getUserById(payload.id)

    if (!user) {
      res.clearCookie('user_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return res.status(401).json({ success: false, message: 'SESIÓN NO VÁLIDA' })
    }

    req.user = { id: user.id, type: 'user' }
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

module.exports = { userAuthMiddleware }
