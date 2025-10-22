const db = require('../config/mysql')
const IQRCode = require('../interfaces/IQRCode')

/**
 * Clase para gestionar códigos QR en el sistema.
 * Cada código QR está asociado a una carrera y un área específica.
 * @extends IQRCode
 */
class QRCode extends IQRCode {
  /**
   * Constructor de la clase QRCode
   * @param {number} id - ID único del código QR
   * @param {string} career - Código de la carrera
   * @param {string} area - Área de actividad (DP/VSS, RS/VCI, CEE/EIE, FCI/ICP, PM/PD)
   * @param {string} imagePath - Ruta de la imagen del código QR
   * @param {string} description - Descripción del código QR
   * @param {boolean} active - Si el código QR está activo
   * @param {number} createdBy - ID del administrador que creó el código QR
   * @param {string} createdAt - Fecha de creación
   * @param {string} updatedAt - Fecha de última actualización
   */
  constructor(id, career, area, imagePath, description, active, createdBy, createdAt, updatedAt) {
    super()
    this.id = id
    this.career = career
    this.area = area
    this.imagePath = imagePath
    this.description = description
    this.active = active
    this.createdBy = createdBy
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Obtiene todos los códigos QR con filtros opcionales.
   * @param {Object} filters - { career, area, active }
   * @returns {Promise<Array>} Lista de códigos QR formateados
   */
  static async getAllQRCodes(filters = {}) {
    try {
      let query = `
        SELECT 
          qr_id,
          qr_career,
          qr_area,
          qr_image_path,
          qr_description,
          qr_active,
          qr_created_by,
          qr_created_at,
          qr_updated_at
        FROM qr_codes
        WHERE 1=1
      `
      const params = []

      if (filters.career) {
        query += ' AND qr_career = ?'
        params.push(filters.career)
      }

      if (filters.area) {
        query += ' AND qr_area = ?'
        params.push(filters.area)
      }

      if (filters.active !== undefined) {
        query += ' AND qr_active = ?'
        params.push(filters.active ? 1 : 0)
      }

      query += ' ORDER BY qr_career, qr_area'

      const qrCodes = await db.query(query, params)
      
      return qrCodes.map(qr => ({
        id: qr.qr_id,
        career: qr.qr_career,
        area: qr.qr_area,
        imagePath: qr.qr_image_path,
        description: qr.qr_description,
        active: !!qr.qr_active,
        createdBy: qr.qr_created_by,
        createdAt: qr.qr_created_at 
          ? new Date(qr.qr_created_at).toISOString().split('T')[0] 
          : null,
        updatedAt: qr.qr_updated_at 
          ? new Date(qr.qr_updated_at).toISOString().split('T')[0] 
          : null
      }))
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS CÓDIGOS QR')
    }
  }

  /**
   * Crea un nuevo código QR.
   * Valida que no exista ya un código QR para la misma carrera y área.
   * @param {Object} data - { career, area, imagePath, description, createdBy }
   * @returns {Promise<number>} ID del nuevo código QR
   */
  static async createQRCode(data) {
    try {
      const { career, area, imagePath, description, createdBy } = data

      // Validar campos requeridos
      if (!career || !area || !imagePath || !createdBy) {
        throw new Error('CARRERA, ÁREA, IMAGEN Y ADMINISTRADOR SON REQUERIDOS')
      }

      // Validar que no exista ya un código QR para esa carrera y área
      const existing = await db.query(
        'SELECT qr_id FROM qr_codes WHERE qr_career = ? AND qr_area = ?',
        [career, area]
      )

      if (existing.length > 0) {
        throw new Error('YA EXISTE UN CÓDIGO QR PARA ESTA CARRERA Y ÁREA')
      }

      const query = `
        INSERT INTO qr_codes (qr_career, qr_area, qr_image_path, qr_description, qr_created_by)
        VALUES (?, ?, ?, ?, ?)
      `
      const result = await db.query(query, [
        career,
        area,
        imagePath,
        description || null,
        createdBy
      ])

      return result.insertId
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL CREAR EL CÓDIGO QR')
    }
  }

  /**
   * Actualiza un código QR existente.
   * Permite actualizar imagen, descripción y estado activo.
   * @param {number} id - ID del código QR
   * @param {Object} data - { imagePath, description, active }
   * @returns {Promise<Object>} { updated: boolean, oldImagePath: string }
   */
  static async updateQRCode(id, data) {
    try {
      if (!id) {
        throw new Error('SE REQUIERE UN ID DE CÓDIGO QR VÁLIDO')
      }

      // Obtener la ruta de la imagen anterior para eliminarla después si hay nueva imagen
      const oldQR = await db.query(
        'SELECT qr_image_path FROM qr_codes WHERE qr_id = ?',
        [id]
      )

      if (oldQR.length === 0) {
        throw new Error('CÓDIGO QR NO ENCONTRADO')
      }

      const { imagePath, description, active } = data
      const updates = []
      const params = []

      if (imagePath !== undefined && imagePath !== null) {
        updates.push('qr_image_path = ?')
        params.push(imagePath)
      }

      if (description !== undefined) {
        updates.push('qr_description = ?')
        params.push(description || null)
      }

      if (active !== undefined) {
        updates.push('qr_active = ?')
        params.push(active ? 1 : 0)
      }

      if (updates.length === 0) {
        throw new Error('NO HAY DATOS PARA ACTUALIZAR')
      }

      params.push(id)

      const query = `
        UPDATE qr_codes 
        SET ${updates.join(', ')}
        WHERE qr_id = ?
      `

      const result = await db.query(query, params)
      
      return {
        updated: result.affectedRows > 0,
        oldImagePath: imagePath ? oldQR[0].qr_image_path : null
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL CÓDIGO QR')
    }
  }

  /**
   * Elimina un código QR del sistema.
   * Retorna la ruta de la imagen para que pueda ser eliminada del sistema de archivos.
   * @param {number} id - ID del código QR
   * @returns {Promise<string>} Ruta de la imagen eliminada
   */
  static async deleteQRCode(id) {
    try {
      if (!id) {
        throw new Error('SE REQUIERE UN ID DE CÓDIGO QR VÁLIDO')
      }

      // Obtener la ruta de la imagen antes de eliminar
      const qr = await db.query(
        'SELECT qr_image_path FROM qr_codes WHERE qr_id = ?',
        [id]
      )

      if (qr.length === 0) {
        throw new Error('CÓDIGO QR NO ENCONTRADO')
      }

      const query = 'DELETE FROM qr_codes WHERE qr_id = ?'
      await db.query(query, [id])

      return qr[0].qr_image_path
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ELIMINAR EL CÓDIGO QR')
    }
  }

  /**
   * Obtiene un código QR por su ID.
   * @param {number} id - ID del código QR
   * @returns {Promise<Object>} Información del código QR formateada
   */
  static async getQRCodeById(id) {
    try {
      if (!id) {
        throw new Error('SE REQUIERE UN ID DE CÓDIGO QR VÁLIDO')
      }

      const query = `
        SELECT 
          qr_id,
          qr_career,
          qr_area,
          qr_image_path,
          qr_description,
          qr_active,
          qr_created_by,
          qr_created_at,
          qr_updated_at
        FROM qr_codes 
        WHERE qr_id = ?
      `
      const result = await db.query(query, [id])
      
      if (result.length === 0) {
        throw new Error('CÓDIGO QR NO ENCONTRADO')
      }

      const qr = result[0]
      return {
        id: qr.qr_id,
        career: qr.qr_career,
        area: qr.qr_area,
        imagePath: qr.qr_image_path,
        description: qr.qr_description,
        active: !!qr.qr_active,
        createdBy: qr.qr_created_by,
        createdAt: qr.qr_created_at 
          ? new Date(qr.qr_created_at).toISOString().split('T')[0] 
          : null,
        updatedAt: qr.qr_updated_at 
          ? new Date(qr.qr_updated_at).toISOString().split('T')[0] 
          : null
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL CÓDIGO QR')
    }
  }

  /**
   * Obtiene todos los códigos QR activos de una carrera específica.
   * Retorna las 5 áreas de actividad disponibles.
   * @param {string} career - Código de carrera
   * @returns {Promise<Array>} Lista de códigos QR de la carrera
   */
  static async getQRCodesByCareer(career) {
    try {
      if (!career) {
        throw new Error('SE REQUIERE UN CÓDIGO DE CARRERA VÁLIDO')
      }

      const query = `
        SELECT 
          qr_id,
          qr_career,
          qr_area,
          qr_image_path,
          qr_description,
          qr_active,
          qr_created_by,
          qr_created_at,
          qr_updated_at
        FROM qr_codes 
        WHERE qr_career = ? AND qr_active = 1
        ORDER BY qr_area
      `
      const result = await db.query(query, [career])
      
      return result.map(qr => ({
        id: qr.qr_id,
        career: qr.qr_career,
        area: qr.qr_area,
        imagePath: qr.qr_image_path,
        description: qr.qr_description,
        active: !!qr.qr_active,
        createdBy: qr.qr_created_by,
        createdAt: qr.qr_created_at 
          ? new Date(qr.qr_created_at).toISOString().split('T')[0] 
          : null,
        updatedAt: qr.qr_updated_at 
          ? new Date(qr.qr_updated_at).toISOString().split('T')[0] 
          : null
      }))
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS CÓDIGOS QR DE LA CARRERA')
    }
  }

  /**
   * Obtiene el código QR activo para una carrera y área específica.
   * @param {string} career - Código de carrera
   * @param {string} area - Área de actividad (DP/VSS, RS/VCI, CEE/EIE, FCI/ICP, PM/PD)
   * @returns {Promise<Object>} Información del código QR
   */
  static async getQRCodeByCareerAndArea(career, area) {
    try {
      if (!career || !area) {
        throw new Error('CARRERA Y ÁREA SON REQUERIDOS')
      }

      const query = `
        SELECT 
          qr_id,
          qr_career,
          qr_area,
          qr_image_path,
          qr_description,
          qr_active,
          qr_created_by,
          qr_created_at,
          qr_updated_at
        FROM qr_codes 
        WHERE qr_career = ? AND qr_area = ? AND qr_active = 1
      `
      const result = await db.query(query, [career, area])
      
      if (result.length === 0) {
        throw new Error('CÓDIGO QR NO ENCONTRADO PARA ESTA CARRERA Y ÁREA')
      }

      const qr = result[0]
      return {
        id: qr.qr_id,
        career: qr.qr_career,
        area: qr.qr_area,
        imagePath: qr.qr_image_path,
        description: qr.qr_description,
        active: !!qr.qr_active,
        createdBy: qr.qr_created_by,
        createdAt: qr.qr_created_at 
          ? new Date(qr.qr_created_at).toISOString().split('T')[0] 
          : null,
        updatedAt: qr.qr_updated_at 
          ? new Date(qr.qr_updated_at).toISOString().split('T')[0] 
          : null
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL CÓDIGO QR')
    }
  }
}

module.exports = QRCode
