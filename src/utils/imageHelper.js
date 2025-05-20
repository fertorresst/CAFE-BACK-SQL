const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

/**
 * Directorio donde se guardarán las evidencias convertidas a webp.
 */
const evidenceDir = path.join(__dirname, '../../uploads/evidence')

/**
 * Crea el directorio de evidencias si no existe.
 */
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true })
}

/**
 * Convierte una imagen a formato webp y la guarda en /uploads/evidence.
 * Elimina el archivo temporal original después de la conversión.
 *
 * @param {string} tempPath - Ruta temporal del archivo subido.
 * @param {string} originalName - Nombre original del archivo (no se usa, pero puede ser útil para logs).
 * @returns {Promise<string>} - Ruta relativa del archivo guardado (para guardar en la base de datos).
 */
async function convertToWebp(tempPath, originalName) {
  // Genera un nombre único para la imagen webp
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`
  const destPath = path.join(evidenceDir, fileName)

  // Convierte la imagen a webp y la guarda en el directorio de evidencias
  await sharp(tempPath)
    .webp({ quality: 85 }) // Calidad alta, tamaño reducido
    .toFile(destPath)

  // Elimina el archivo temporal original
  fs.unlinkSync(tempPath)

  // Devuelve la ruta relativa para guardar en la base de datos
  return `/evidence/${fileName}`
}

module.exports = { convertToWebp }
