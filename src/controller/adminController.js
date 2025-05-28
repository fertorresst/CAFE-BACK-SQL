const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')

/**
 * Obtiene todos los administradores registrados.
 * @route GET /admins
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAllAdmins()
    res.status(200).json({
      admins,
      success: true,
      message: admins.length > 0
        ? 'ADMINISTRADORES OBTENIDOS CORRECTAMENTE'
        : 'NO SE ENCONTRARON ADMINISTRADORES'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Crea un nuevo administrador.
 * Valida que el correo y el teléfono no estén registrados previamente.
 * @route POST /admins
 */
const createAdmin = async (req, res) => {
  try {
    const data = req.body
    const newAdminId = await Admin.createAdmin(data)
    res.status(201).json({
      id: newAdminId,
      success: true,
      message: 'ADMINISTRADOR CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza los datos de un administrador.
 * Valida que el correo y el teléfono no estén registrados previamente por otro admin.
 * @route PUT /admins/:id
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const updated = await Admin.updateAdmin(id, data)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'ADMINISTRADOR ACTUALIZADO CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL ADMINISTRADOR O NO HUBO CAMBIOS'
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza la contraseña de un administrador.
 * @route PUT /admins/:id/password
 */
const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body
    const updated = await Admin.updatePassword(id, password)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'CONTRASEÑA ACTUALIZADA CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL ADMINISTRADOR O NO HUBO CAMBIOS'
      })
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Cambia el estado activo/inactivo de un administrador.
 * @route PATCH /admins/:id/active
 */
const setAdminActive = async (req, res) => {
  try {
    const { id } = req.params
    const { active } = req.body
    await Admin.setAdminActive(id, active)
    res.status(200).json({
      success: true,
      message: active ? 'ADMINISTRADOR ACTIVADO CORRECTAMENTE' : 'ADMINISTRADOR DESACTIVADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Elimina un administrador del sistema.
 * @route DELETE /admins/:id
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params
    await Admin.deleteAdmin(id)
    res.status(200).json({
      success: true,
      message: 'ADMINISTRADOR ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Inicia sesión un administrador.
 * @route POST /admins/login
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    const admin = await Admin.login(email, password)
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })
    res.json({
      success: true,
      message: 'LOGIN EXITOSO',
      admin
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  updateAdminPassword,
  setAdminActive,
  deleteAdmin,
  loginAdmin
}