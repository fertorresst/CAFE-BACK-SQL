const express = require("express")
const rateLimit = require('express-rate-limit')
const router = express.Router()

const {
  updateUser,
  loginUser,
  getAllUsers,
  createUser,
  sendVerificationCode,
  verifyEmailCode,
  updateUserPassword,
  deleteUser,
  getUserById,
  getAllUsersWithActivities,
  getProfile,
  updateProfile
} = require("../controller/userController")

const { userAuthMiddleware } = require('../auth/userAuthMiddleware')
const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'DEMASIADOS INTENTOS DE REGISTRO. INTENTA NUEVAMENTE EN 15 MINUTOS.'
  }
})

/*const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'DEMASIADAS SOLICITUDES DE CÓDIGO. INTENTA NUEVAMENTE EN 15 MINUTOS.'
  }
}) */ 

// Obtener todos los usuarios
router.get("/get-all-users", adminAuthMiddleware, getAllUsers)

// Enviar código de verificación al correo institucional
//router.post("/send-verification-code", verificationLimiter, sendVerificationCode)

// Verificar código enviado al correo institucional
//router.post("/verify-email-code", verifyEmailCode)

// Crear usuario
router.post("/create-user", registerLimiter, createUser)

// Crear usuario
router.post( "/create-user", registerLimiter, createUser )

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
  res.clearCookie('user_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
  res.json({ success: true, message: 'SESIÓN DE USUARIO CERRADA' })
})

// Obtener datos completos del usuario autenticado
router.get('/me', userAuthMiddleware, getProfile)

// Rutas de perfil del estudiante autenticado
router.get('/profile', userAuthMiddleware, getProfile);
router.put('/update-profile', userAuthMiddleware, updateProfile);

module.exports = router