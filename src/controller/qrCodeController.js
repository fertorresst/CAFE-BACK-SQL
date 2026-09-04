const QRCode = require('../models/qrCodeModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs').promises

/**
 * Obtiene todos los códigos QR con filtros opcionales.
 * Solo superadmin tiene acceso a esta función.
 * @route GET /qr-codes/get-all-qr-codes
 */
const getAllQRCodes = async (req, res) => {
  const { adminRole } = req

  try {
    // Validar permisos de superadmin
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'SOLO EL SUPERADMIN PUEDE GESTIONAR CÓDIGOS QR'
      })
    }

    // Construir filtros desde query parameters
    const filters = {
      career: req.query.career,
      area: req.query.area,
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined
    }

    const qrCodes = await QRCode.getAllQRCodes(filters)

    res.status(200).json({
      success: true,
      qrCodes,
      message: qrCodes.length > 0
        ? 'CÓDIGOS QR OBTENIDOS CORRECTAMENTE'
        : 'NO SE ENCONTRARON CÓDIGOS QR'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Busca cuáles de las carreras seleccionadas ya tienen
 * un código QR registrado para un área específica.
 *
 * @param {Array<string>} careers - Códigos de las carreras
 * @param {string} area - Área del código QR
 * @returns {Promise<Array<string>>} Carreras que ya tienen QR
 */

/**
 * Crea un nuevo código QR con imagen.
 * Solo superadmin puede crear códigos QR.
 * @route POST /qr-codes/create-qr-code
 */
const createQRCode = async (req, res) => {
  const { adminRole, adminId } = req

  const createdFiles = []

  try {
    // Validar permisos
    if (adminRole !== 'superadmin') {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {})
      }

      return res.status(403).json({
        success: false,
        message: 'SOLO EL SUPERADMIN PUEDE CREAR CÓDIGOS QR'
      })
    }

    // Validar imagen
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'LA IMAGEN DEL CÓDIGO QR ES REQUERIDA'
      })
    }

    const {
      careers: careersJSON,
      area,
      description
    } = req.body

    let careers

    // Convertir las carreras recibidas en JSON
    try {
      careers = JSON.parse(careersJSON)
    } catch (error) {
      await fs.unlink(req.file.path).catch(() => {})

      return res.status(400).json({
        success: false,
        message: 'LAS CARRERAS SELECCIONADAS NO SON VÁLIDAS'
      })
    }

    // Validar datos obligatorios
    if (
      !Array.isArray(careers) ||
      careers.length === 0 ||
      !area
    ) {
      await fs.unlink(req.file.path).catch(() => {})

      return res.status(400).json({
        success: false,
        message: 'DEBES SELECCIONAR AL MENOS UNA CARRERA Y UN ÁREA'
      })
    }

    // Limpiar datos y eliminar posibles duplicados
    careers = [
      ...new Set(
        careers
          .filter(career => typeof career === 'string')
          .map(career => career.trim())
          .filter(Boolean)
      )
    ]

    if (careers.length === 0) {
      await fs.unlink(req.file.path).catch(() => {})

      return res.status(400).json({
        success: false,
        message: 'DEBES SELECCIONAR AL MENOS UNA CARRERA'
      })
    }

    /*
     * IMPORTANTE:
     * Antes de crear cualquier archivo o registro,
     * comprobamos todas las carreras seleccionadas.
     */
    const existingCareers =
      await QRCode.getExistingCareersForArea(careers, area)

    if (existingCareers.length > 0) {
      // Multer ya guardó temporalmente la imagen,
      // así que la eliminamos porque no se creará nada.
      await fs.unlink(req.file.path).catch(() => {})

      return res.status(409).json({
        success: false,
        message:
          'YA EXISTE UN CÓDIGO QR PARA UNA O MÁS DE LAS CARRERAS SELECCIONADAS EN ESTA ÁREA',
        existingCareers
      })
    }

    /*
     * Llegados hasta aquí sabemos que ninguna combinación
     * carrera + área existe todavía.
     */

    const uploadDirectory = path.dirname(req.file.path)

    const extension = path
      .extname(req.file.originalname)
      .toLowerCase()

    const areaClean = area.replace(/\//g, '-')

    const createdIds = []

    // Crear un archivo y registro independiente por carrera
    for (const career of careers) {
      const uniqueSuffix =
        `${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 10)}`

      const fileName =
        `${career}_${areaClean}_${uniqueSuffix}${extension}`

      const destinationPath = path.join(
        uploadDirectory,
        fileName
      )

      // Copia física independiente
      await fs.copyFile(
        req.file.path,
        destinationPath
      )

      createdFiles.push(destinationPath)

      const relativePath = `/qr-codes/${fileName}`

      const data = {
        career,
        area,
        imagePath: relativePath,
        description,
        createdBy: adminId
      }

      const newQRId =
        await QRCode.createQRCode(data)

      createdIds.push(newQRId)
    }

    // Borrar archivo temporal original
    await fs.unlink(req.file.path).catch(() => {})

    return res.status(201).json({
      success: true,
      ids: createdIds,
      message:
        createdIds.length === 1
          ? 'CÓDIGO QR CREADO CORRECTAMENTE'
          : `${createdIds.length} CÓDIGOS QR CREADOS CORRECTAMENTE`
    })
  } catch (err) {
    // Borrar archivo temporal
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {})
    }

    // Borrar las copias físicas creadas
    for (const filePath of createdFiles) {
      await fs.unlink(filePath).catch(() => {})
    }

    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Actualiza un código QR existente.
 * Permite actualizar imagen, descripción y estado activo.
 * Solo superadmin puede actualizar códigos QR.
 * @route PUT /qr-codes/update-qr-code/:id
 */
const updateQRCode = async (req, res) => {
  const { adminRole } = req

  try {
    // Validar permisos de superadmin
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'SOLO EL SUPERADMIN PUEDE ACTUALIZAR CÓDIGOS QR'
      })
    }

    const { id } = req.params
    const { description, active } = req.body

    // Construir objeto de datos a actualizar
    // Si hay nueva imagen, usar ruta relativa
    const data = {
      imagePath: req.file ? `/qr-codes/${req.file.filename}` : undefined,
      description,
      active: active !== undefined ? active === 'true' || active === true : undefined
    }

    const result = await QRCode.updateQRCode(id, data)

    if (result.updated) {
      // Si se subió una nueva imagen y hay imagen anterior, eliminar la anterior
      if (req.file && result.oldImagePath) {
        // Construir ruta completa desde la ruta relativa guardada en BD
        const fullOldPath = path.join(__dirname, '../../uploads', result.oldImagePath)
        await fs.unlink(fullOldPath).catch(() => {})
      }

      res.status(200).json({
        success: true,
        message: 'CÓDIGO QR ACTUALIZADO CORRECTAMENTE'
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'NO SE ENCONTRÓ EL CÓDIGO QR O NO HUBO CAMBIOS'
      })
    }
  } catch (err) {
    // Si hay error y se subió un archivo, eliminarlo
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {})
    }
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Elimina un código QR del sistema.
 * También elimina la imagen asociada del sistema de archivos.
 * Solo superadmin puede eliminar códigos QR.
 * @route DELETE /qr-codes/delete-qr-code/:id
 */
const deleteQRCode = async (req, res) => {
  const { adminRole } = req

  try {
    // Validar permisos de superadmin
    if (adminRole !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'SOLO EL SUPERADMIN PUEDE ELIMINAR CÓDIGOS QR'
      })
    }

    const { id } = req.params

    // Eliminar el código QR de la base de datos
    const imagePath = await QRCode.deleteQRCode(id)

    // Eliminar el archivo de imagen del sistema de archivos
    if (imagePath) {
      // Construir ruta completa desde la ruta relativa guardada en BD
      const fullPath = path.join(__dirname, '../../uploads', imagePath)
      await fs.unlink(fullPath).catch((err) => {
        console.log('ERROR AL ELIMINAR IMAGEN:', err)
      })
    }

    res.status(200).json({
      success: true,
      message: 'CÓDIGO QR ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene los códigos QR de la carrera del estudiante autenticado.
 * Retorna las 5 áreas disponibles para su carrera.
 * @route GET /qr-codes/get-my-qr-codes
 */
const getMyQRCodes = async (req, res) => {
  try {
    const userId = req.user.id // ID viene del middleware de autenticación de usuario

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'NO AUTORIZADO'
      })
    }

    // Obtener datos completos del usuario desde la base de datos
    const user = await User.getUserById(userId)

    if (!user || !user.career) {
      return res.status(400).json({
        success: false,
        message: 'NO SE PUDO IDENTIFICAR TU CARRERA'
      })
    }

    // Obtener códigos QR de la carrera del estudiante
    const qrCodes = await QRCode.getQRCodesByCareer(user.career)

    res.status(200).json({
      success: true,
      qrCodes,
      message: qrCodes.length > 0
        ? 'CÓDIGOS QR OBTENIDOS CORRECTAMENTE'
        : 'NO SE ENCONTRARON CÓDIGOS QR PARA TU CARRERA'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Obtiene un código QR específico por carrera y área.
 * Utilizado cuando un estudiante necesita escanear un QR de un área específica.
 * @route GET /qr-codes/get-by-career-area
 */
const getQRCodeByCareerAndArea = async (req, res) => {
  try {
    const { area } = req.query

    if (!area) {
      return res.status(400).json({
        success: false,
        message: 'ÁREA ES REQUERIDA'
      })
    }

    const user = await User.getUserById(req.user.id)
    const qrCode = await QRCode.getQRCodeByCareerAndArea(user.career, area)

    res.status(200).json({
      success: true,
      qrCode,
      message: 'CÓDIGO QR OBTENIDO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = {
  getAllQRCodes,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  getMyQRCodes,
  getQRCodeByCareerAndArea
}
