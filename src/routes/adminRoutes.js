const express = require("express")
const router = express.Router()
const jwt = require('jsonwebtoken')

const {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  updateAdminPassword,
  setAdminActive,
  deleteAdmin,
  loginAdmin,
  getAdminById
} = require("../controller/adminController")

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

// Obtener todos los administradores
router.get("/get-all-admins", adminAuthMiddleware, getAllAdmins)

// Crear un nuevo administrador
router.post("/create-admin", adminAuthMiddleware, createAdmin)

// Actualizar un administrador
router.put("/update-admin/:id", adminAuthMiddleware, updateAdmin)

// Actualizar la contraseña de un administrador
router.patch("/update-admin-password/:id", adminAuthMiddleware, updateAdminPassword)

// Activar o desactivar un administrador
router.patch("/set-admin-active/:id", adminAuthMiddleware, setAdminActive)

// Eliminar un administrador
router.delete("/delete-admin/:id", adminAuthMiddleware, deleteAdmin)

// Obtener información de un administrador por ID
router.get("/get-admin/:id", adminAuthMiddleware, getAdminById)

// Ejemplo usando Express
router.post('/login', loginAdmin)

router.post('/logout', (req, res) => {
  console.log('CERRANDO SESIÓN')
  res.clearCookie('admin_token')
  res.json({ success: true, message: 'SESIÓN CERRADA' })
})

router.get('/me', adminAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  })
})

module.exports = router