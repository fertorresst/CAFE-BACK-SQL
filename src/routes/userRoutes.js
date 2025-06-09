const express = require("express")
const router = express.Router()

const {
  updateUser,
  loginUser,
  getAllUsers,
  createUser,
  updateUserPassword,
  deleteUser,
  getUserById
} = require("../controller/userController")

const { userAuthMiddleware } = require('../auth/userAuthMiddleware')
const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

// Obtener todos los usuarios
router.get("/get-all-users", adminAuthMiddleware, getAllUsers)

// Crear usuario
router.post("/create-user", createUser)

// Actualizar usuario
router.put("/update-user/:id", userAuthMiddleware, updateUser)

// Actualizar contraseña por usuario
router.put("/update-password-by-user/:id", userAuthMiddleware, updateUserPassword)

// Actualizar contraseña por administrador
router.put("/update-password-by-admin/:id", adminAuthMiddleware, updateUserPassword)

// Eliminar usuario
router.delete("/delete-user/:id", adminAuthMiddleware, deleteUser)

// Obtener información de un usuario por ID
router.get("/get-user/:id", userAuthMiddleware, getUserById)

// Login usuario
router.post("/login", loginUser)

// Logout usuario
router.post('/logout', (req, res) => {
  console.log('CERRANDO SESIÓN USUARIO')
  res.clearCookie('user_token')
  res.json({ success: true, message: 'SESIÓN DE USUARIO CERRADA' })
})

// Middleware de autenticación para rutas protegidas
router.get('/me', userAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})

module.exports = router