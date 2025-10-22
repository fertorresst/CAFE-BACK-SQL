const express = require("express")
const router = express.Router()

const {
  updateUser,
  loginUser,
  getAllUsers,
  createUser,
  updateUserPassword,
  deleteUser,
  getUserById,
  getAllUsersWithActivities,
  getProfile,
  updateProfile
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

// Obtener todos los estudiantes con sus actividades (solo admin y superadmin)
router.get("/students-with-activities", adminAuthMiddleware, getAllUsersWithActivities)

// Login usuario
router.post("/login", loginUser)

// Logout usuario
router.post('/logout', (req, res) => {
  console.log('CERRANDO SESIÓN USUARIO')
  res.clearCookie('user_token')
  res.json({ success: true, message: 'SESIÓN DE USUARIO CERRADA' })
})

// Obtener datos completos del usuario autenticado
router.get('/me', userAuthMiddleware, getProfile)

// Rutas de perfil del estudiante autenticado
router.get('/profile', userAuthMiddleware, getProfile);
router.put('/update-profile', userAuthMiddleware, updateProfile);

module.exports = router