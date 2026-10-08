const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')
require('dotenv').config()

/**
 * Middleware de autenticación de admins que verifica el token JWT en las cookies.
 * Además valida que el administrador siga existiendo y continúe activo.
 */
async function adminAuthMiddleware(req, res, next) {
  const token = req.cookies.admin_token
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const admin = await Admin.getAdminById(payload.id)

    if (!admin || !admin.active) {
      res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return res.status(401).json({ success: false, message: 'SESIÓN NO VÁLIDA' })
    }

    req.admin = { id: admin.id, role: admin.role }
    req.adminRole = admin.role
    req.adminId = admin.id
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

module.exports = { adminAuthMiddleware }
