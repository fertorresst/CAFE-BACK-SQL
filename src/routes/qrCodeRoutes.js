const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const {
  getAllQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  getMyQRCodes,
  getQRCodeByCareerAndArea
} = require('../controller/qrCodeController')

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')
const { userAuthMiddleware } = require('../auth/userAuthMiddleware')

/**
 * Crear directorio para códigos QR si no existe
 */
const uploadDir = path.join(__dirname, '../../uploads/qr-codes')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

/**
 * Configuración de almacenamiento de Multer para imágenes de códigos QR
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const { career, area } = req.body
    // Nombre de archivo: CARRERA_AREA_UUID.extension
    const areaClean = area ? area.replace(/\//g, '-') : 'UNKNOWN'
    const uniqueId = uuidv4().substring(0, 8)
    const ext = path.extname(file.originalname)
    cb(null, `${career || 'UNKNOWN'}_${areaClean}_${uniqueId}${ext}`)
  }
})

/**
 * Filtro de archivos: solo permite imágenes JPG, JPEG y PNG
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('SOLO SE PERMITEN IMÁGENES (JPG, JPEG, PNG)'))
  }
}

/**
 * Middleware de Multer configurado:
 * - Límite de tamaño: 5MB
 * - Solo imágenes JPG, JPEG, PNG
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
})

// ============================================================
// RUTAS PARA ADMINISTRADORES (Gestión de códigos QR)
// Solo superadmin tiene acceso a estas rutas
// ============================================================

/**
 * Obtiene todos los códigos QR con filtros opcionales
 * @query {string} career - Filtro por código de carrera (opcional)
 * @query {string} area - Filtro por área (opcional)
 * @query {boolean} active - Filtro por estado activo (opcional)
 */
router.get('/get-all-qr-codes', adminAuthMiddleware, getAllQRCodes)

/**
 * Crea un nuevo código QR con imagen
 * @body {string} career - Código de carrera (requerido)
 * @body {string} area - Área de actividad (requerido)
 * @body {string} description - Descripción del código QR (opcional)
 * @body {file} qrImage - Imagen del código QR (requerido)
 */
router.post(
  '/create-qr-code',
  adminAuthMiddleware,
  upload.single('qrImage'),
  createQRCode
)

/**
 * Actualiza un código QR existente
 * @param {number} id - ID del código QR
 * @body {string} description - Descripción actualizada (opcional)
 * @body {boolean} active - Estado activo (opcional)
 * @body {file} qrImage - Nueva imagen del código QR (opcional)
 */
router.put(
  '/update-qr-code/:id',
  adminAuthMiddleware,
  upload.single('qrImage'),
  updateQRCode
)

/**
 * Elimina un código QR
 * @param {number} id - ID del código QR
 */
router.delete('/delete-qr-code/:id', adminAuthMiddleware, deleteQRCode)

// ============================================================
// RUTAS PARA ESTUDIANTES (Consulta de códigos QR)
// Requieren autenticación de usuario
// ============================================================

/**
 * Obtiene los códigos QR activos de la carrera del estudiante autenticado
 * Retorna las 5 áreas disponibles para su carrera
 */
router.get('/get-my-qr-codes', userAuthMiddleware, getMyQRCodes)

/**
 * Obtiene un código QR específico por carrera y área
 * @query {string} career - Código de carrera (requerido)
 * @query {string} area - Área de actividad (requerido)
 */
router.get('/get-by-career-area', userAuthMiddleware, getQRCodeByCareerAndArea)

module.exports = router
