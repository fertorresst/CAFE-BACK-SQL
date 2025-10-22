const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

/**
 * Obtiene todos los usuarios registrados.
 * @route GET /users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers()
    const teachers = users.filter(u => u.isTeacher)
    const students = users.filter(u => !u.isTeacher)
    res.status(200).json({
      teachers,
      students,
      success: true,
      message: users.length > 0
        ? 'USUARIOS OBTENIDOS CORRECTAMENTE'
        : 'NO SE ENCONTRARON USUARIOS'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Crea un nuevo usuario.
 * @route POST /users/create-user
 */
const createUser = async (req, res) => {
  try {
    const data = req.body
    const newUserId = await User.createUser(data)
    res.status(201).json({
      id: newUserId,
      success: true,
      message: 'USUARIO CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza los datos de un usuario.
 * @route PUT /users/update-user/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const updated = await User.updateUser(id, data)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'USUARIO ACTUALIZADO CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL USUARIO O NO HUBO CAMBIOS'
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
 * Actualiza la contraseña de un usuario.
 * @route PUT /users/update-password/:id
 */
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body
    const updated = await User.updatePassword(id, newPassword)
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'CONTRASEÑA ACTUALIZADA CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL USUARIO O NO HUBO CAMBIOS'
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
 * Elimina un usuario del sistema.
 * @route DELETE /users/delete-user/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    await User.deleteUser(id)
    res.status(200).json({
      success: true,
      message: 'USUARIO ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Inicia sesión un usuario.
 * @route POST /users/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.login(email, password)
    const token = jwt.sign(
      { id: user.id, isTeacher: user.isTeacher, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    res.cookie('user_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    })
    res.json({
      success: true,
      message: 'LOGIN EXITOSO',
      user
    })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene la información de un usuario por su ID.
 * @route GET /users/get-user/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.getUserById(Number(id))
    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene todos los estudiantes con la información de sus actividades enviadas.
 * Solo accesible para admin y superadmin.
 * @route GET /users/students-with-activities
 */
const getAllUsersWithActivities = async (req, res) => {
  try {
    // Validar rol (debe venir del middleware de autenticación)
    const role = req.admin?.role
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'NO AUTORIZADO'
      })
    }

    const students = await User.getAllUsersWithActivities()
    res.status(200).json({
      success: true,
      students
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene el perfil del estudiante autenticado.
 * @route GET /users/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id // Viene del middleware de autenticación
    const user = await User.getUserById(userId)
    res.status(200).json({
      success: true,
      user
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Actualiza el perfil del estudiante autenticado.
 * Permite actualizar: nombre, apellidos, teléfono, email, NUA, carrera, sede.
 * @route PUT /users/update-profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, lastName, secondLastName, email, phone, nua, career, sede } = req.body;

    // Validar campos requeridos
    if (!name || !lastName || !email || !phone || !nua || !career || !sede) {
      return res.status(400).json({
        success: false,
        message: 'TODOS LOS CAMPOS SON OBLIGATORIOS'
      });
    }

    // Validar formato de NUA
    if (isNaN(nua) || nua.toString().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'EL NUA DEBE TENER AL MENOS 6 DÍGITOS'
      });
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'EL CORREO ELECTRÓNICO DEBE SER INSTITUCIONAL (@ugto.mx)'
      });
    }

    // Validar longitud del teléfono (debe ser 10 dígitos)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'EL TELÉFONO DEBE TENER 10 DÍGITOS'
      });
    }

    // Validar carrera
    const validCareers = [
      "IS75LI0103",
      "IS75LI0203",
      "IS75LI0303",
      "IS75LI03Y3",
      "IS75LI0403",
      "IS75LI0502",
      "IS75LI05Y2",
      "IS75LI0602",
      "IS75LI06Y2",
      "IS75LI0702",
      "IS75LI0801",
      "IS75LI08Y2",
    ];
    if (!validCareers.includes(career)) {
      return res.status(400).json({
        success: false,
        message: 'LA CARRERA SELECCIONADA NO ES VÁLIDA'
      });
    }

    // Validar sede
    const validSedes = ["SALAMANCA", "YURIRIA"];
    if (!validSedes.includes(sede.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'LA SEDE DEBE SER "SALAMANCA" O "YURIRIA"'
      });
    }

    // Actualizar todos los campos de perfil (incluye NUA, carrera, sede)
    const data = {
      nua: Number(nua),
      name,
      lastName,
      secondLastName: secondLastName || null,
      email,
      phone: phoneDigits,
      career,
      sede: sede.toUpperCase()
    };

    const updated = await User.updateUserProfile(userId, data);
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'PERFIL ACTUALIZADO CORRECTAMENTE'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'NO SE PUDO ACTUALIZAR EL PERFIL'
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  loginUser,
  getUserById,
  getAllUsersWithActivities,
  getProfile,
  updateProfile
}
