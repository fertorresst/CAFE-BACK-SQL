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

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  loginUser,
  getUserById
}
