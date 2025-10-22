const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')

/**
 * Obtiene todos los administradores registrados.
 * @route GET /admins
 */
const getAllAdmins = async (req, res) => {
  const { adminRole } = req

  try {
    // Solo superadmin puede ver todos los administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA CONSULTAR ADMINISTRADORES'
      })
    }
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
 * @route POST /admins
 */
const createAdmin = async (req, res) => {
  const { adminRole } = req
  try {
    // Solo superadmin puede crear administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA CREAR ADMINISTRADORES'
      })
    }
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
 * @route PUT /admins/:id
 */
const updateAdmin = async (req, res) => {
  const { adminRole } = req
  try {
    // Solo superadmin puede actualizar administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR ADMINISTRADORES'
      })
    }
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
  const { adminRole } = req
  try {
    // Solo superadmin puede actualizar contraseñas de otros administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR CONTRASEÑAS DE ADMINISTRADORES'
      })
    }
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
  const { adminRole } = req
  try {
    // Solo superadmin puede activar/desactivar administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR ADMINISTRADORES'
      })
    }
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
  const { adminRole } = req
  try {
    // Solo superadmin puede eliminar administradores
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA ELIMINAR ADMINISTRADORES'
      })
    }
    const { id } = req.params
    // El id del admin actual debe venir en el body (por seguridad)
    const { currentAdminId } = req.body
    await Admin.deleteAdmin(Number(id), Number(currentAdminId))
    res.status(200).json({
      success: true,
      message: 'ADMINISTRADOR ELIMINADO EXITOSAMENTE.'
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene la información de un administrador por su ID.
 * @route GET /admin/:id
 */
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params
    const admin = await Admin.getAdminById(Number(id))
    res.status(200).json({
      success: true,
      admin
    })
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
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
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
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

/**
 * Obtiene el perfil del administrador autenticado.
 * @route GET /admins/profile
 */
const getProfile = async (req, res) => {
  try {
    const adminId = req.admin.id // Viene del middleware de autenticación
    const admin = await Admin.getAdminById(adminId)
    res.status(200).json({
      success: true,
      admin
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Actualiza el perfil del administrador autenticado.
 * @route PUT /admins/update-profile
 */
const updateProfile = async (req, res) => {
  try {
    const adminId = req.admin.id
    const adminRole = req.admin.role

    // Solo superadmin y admin pueden editar su perfil
    if (adminRole !== 'superadmin' && adminRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA EDITAR TU PERFIL'
      })
    }

    const { name, lastName, secondLastName, email, phone } = req.body

    // Validar campos requeridos
    if (!name || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'TODOS LOS CAMPOS SON OBLIGATORIOS'
      })
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO NO ES VÁLIDO'
      })
    }

    // Validar longitud del teléfono (debe ser 10 dígitos)
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'EL TELÉFONO DEBE TENER 10 DÍGITOS'
      })
    }

    // Actualizar solo campos permitidos
    const data = {
      name,
      lastName,
      secondLastName: secondLastName || null,
      email,
      phone: phoneDigits
    }

    const updated = await Admin.updateAdminProfile(adminId, data)
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'PERFIL ACTUALIZADO CORRECTAMENTE'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'NO SE PUDO ACTUALIZAR EL PERFIL'
      })
    }
  } catch (err) {
    res.status(400).json({
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
  loginAdmin,
  getAdminById,
  getProfile,
  updateProfile
}