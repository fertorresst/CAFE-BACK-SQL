const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

/**
 * Middleware para la carga de archivos de evidencia (imágenes).
 * Utiliza multer para almacenar archivos temporalmente antes de procesarlos.
 */

// Definir carpeta temporal para archivos subidos
const tempDir = path.join(__dirname, '../../uploads/temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

/**
 * Configuración de almacenamiento de multer:
 * - destination: carpeta temporal
 * - filename: nombre único usando uuid
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, uuidv4() + ext)
  }
})

/**
 * Filtro de archivos:
 * Solo permite imágenes JPEG, PNG, JPG y WEBP.
 */
const fileFilter = (req, file, cb) => {
  if (/image\/(jpeg|png|jpg|webp)/.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, jpg, webp)'), false)
  }
}

/**
 * Middleware de multer configurado:
 * - Límite de tamaño: 5MB por archivo
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 5MB
})

module.exports = upload
