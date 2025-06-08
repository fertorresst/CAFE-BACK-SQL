const db = require('../config/mysql')
const IContact = require('../interfaces/IPeriod')

/**
 * Modelo para la gestión de contactos administrativos.
 */
class Contact extends IContact {
  /**
   * Constructor de la clase Contact.
   * @param {number} id - ID del contacto
   * @param {number} userId - ID del usuario
   * @param {number} adminId - ID del administrador
   * @param {number} periodId - ID del periodo
   * @param {number|null} activityId - ID de la actividad (puede ser null)
   * @param {string} description - Descripción del contacto
   * @param {string} observations - Observaciones del contacto
   * @param {string} status - Estado del contacto
   * @param {number|null} lastAdminId - ID del último admin que modificó el contacto
   * @param {string} createdAt - Fecha de creación
   * @param {string} updatedAt - Fecha de actualización
   */
  constructor(id, userId, adminId, periodId, activityId, description, observations, status, lastAdminId, createdAt, updatedAt) {
    super()
    this.id = id
    this.userId = userId
    this.adminId = adminId
    this.periodId = periodId
    this.activityId = activityId
    this.description = description
    this.observations = observations
    this.status = status
    this.lastAdminId = lastAdminId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Obtiene todos los contactos administrativos de un periodo.
   * @param {number} periodId - ID del periodo
   * @returns {Promise<Array>} Lista de contactos
   */
  static async getContactsByPeriod(periodId, adminRole, adminId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      }

      // Si es consulta, regresa vacío
      if (adminRole === 'consulta') {
        return []
      }

      let query = `
        SELECT 
          c.con_id, 
          c.con_description, 
          c.con_observations, 
          c.con_status, 
          c.con_last_admin_id,
          c.con_created_at, 
          c.con_updated_at,
          u.use_id,
          u.use_nua,
          u.use_name AS user_name,
          u.use_last_name AS user_last_name,
          u.use_second_last_name AS user_second_last_name,
          u.use_phone,
          u.use_email,
          a.adm_id,
          a.adm_name AS admin_name,
          a.adm_last_name AS admin_last_name,
          a.adm_second_last_name AS admin_second_last_name,
          p.per_id,
          p.per_name AS period_name,
          ac.act_id,
          ac.act_name,
          la.adm_id AS last_admin_id,
          la.adm_name AS last_admin_name,
          la.adm_last_name AS last_admin_last_name,
          la.adm_second_last_name AS last_admin_second_last_name
        FROM contact c
        INNER JOIN users u ON c.con_user_id = u.use_id
        INNER JOIN admins a ON c.con_admin_id = a.adm_id
        INNER JOIN periods p ON c.con_period_id = p.per_id
        LEFT JOIN activities ac ON c.con_activity_id = ac.act_id
        LEFT JOIN admins la ON c.con_last_admin_id = la.adm_id
        WHERE c.con_period_id = ?
      `

      // Si es validador, solo ve sus propios contactos
      let params = [periodId]
      if (adminRole === 'validador') {
        query += ' AND c.con_admin_id = ?'
        params.push(adminId)
      }

      query += `
        ORDER BY 
          CASE c.con_status
            WHEN 'pending' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'resolved' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          c.con_created_at DESC
      `

      const contacts = await db.query(query, params)
      if (!contacts || contacts.length === 0) {
        return []
      }
      return contacts.map(contact => {
        const userFullName = `${contact.user_name} ${contact.user_last_name} ${contact.user_second_last_name || ''}`.trim()
        const adminFullName = `${contact.admin_name} ${contact.admin_last_name || ''} ${contact.admin_second_last_name || ''}`.trim()
        let relatedItem = null
        if (contact.act_id) {
          relatedItem = {
            type: 'activity',
            id: contact.act_id,
            name: contact.act_name
          }
        }
        let lastAdminFullName = null
        if (contact.last_admin_id) {
          lastAdminFullName = `${contact.last_admin_name} ${contact.last_admin_last_name || ''} ${contact.last_admin_second_last_name || ''}`.trim()
        }
        contact.con_created_at = new Date(contact.con_created_at).toISOString().split('T')[0]
        contact.con_updated_at = new Date(contact.con_updated_at).toISOString().split('T')[0]
        return {
          id: contact.con_id,
          description: contact.con_description,
          observations: contact.con_observations,
          status: contact.con_status,
          lastAdminId: contact.con_last_admin_id,
          lastAdminName: lastAdminFullName,
          createdAt: contact.con_created_at,
          updatedAt: contact.con_updated_at,
          periodId: contact.per_id,
          periodName: contact.period_name,
          user: {
            id: contact.use_id,
            nua: contact.use_nua,
            name: userFullName,
            phone: contact.use_phone,
            email: contact.use_email
          },
          admin: {
            id: contact.adm_id,
            name: adminFullName
          },
          relatedItem
        }
      })
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS CONTACTOS DEL PERIODO')
    }
  }

  /**
   * Elimina un contacto por su ID.
   * @param {number} id - ID del contacto
   */
  static async deleteContactById(id) {
    try {
      const query = `
        DELETE FROM contact
        WHERE con_id = ?
      `
      await db.query(query, [id])
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ELIMINAR EL CONTACTO')
    }
  }

  /**
   * Actualiza las observaciones y el estado de un contacto.
   * @param {number} id - ID del contacto
   * @param {string} observations - Observaciones
   * @param {string} status - Estado
   * @param {number} lastAdminId - ID del último admin que modificó el contacto
   */
  static async updateContact(id, observations, status, lastAdminId) {
    try {
      const query = `
        UPDATE contact
        SET con_observations = ?, con_status = ?, con_last_admin_id = ?, con_updated_at = CURRENT_TIMESTAMP
        WHERE con_id = ?
      `
      await db.query(query, [observations, status, lastAdminId || null, id])
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL CONTACTO')
    }
  }

  /**
   * Crea un nuevo contacto administrativo.
   * @param {number} userId - ID del usuario
   * @param {number} adminId - ID del administrador
   * @param {number} periodId - ID del periodo
   * @param {number|null} activityId - ID de la actividad (puede ser null)
   * @param {string} description - Descripción del contacto
   * @param {number} lastAdminId - ID del último admin que crea el contacto
   * @returns {Promise<number>} ID del nuevo contacto
   */
  static async createContact(userId, adminId, periodId, activityId, description, lastAdminId) {
    try {
      // Validaciones básicas
      if (!userId || !adminId || !periodId || !description) {
        throw new Error('SE REQUIEREN TODOS LOS CAMPOS OBLIGATORIOS')
      }
      // Verificar si ya existe un contacto para esta combinación
      let checkQuery
      let checkParams
      if (activityId) {
        // Verificar duplicado para actividad específica
        checkQuery = `
          SELECT con_id, con_status FROM contact 
          WHERE con_user_id = ? AND con_period_id = ? AND con_activity_id = ?
        `
        checkParams = [userId, periodId, activityId]
      } else {
        // Verificar duplicado para contacto general (sin actividad)
        checkQuery = `
          SELECT con_id, con_status FROM contact 
          WHERE con_user_id = ? AND con_period_id = ? AND con_activity_id IS NULL
        `
        checkParams = [userId, periodId]
      }
      const existingContacts = await db.query(checkQuery, checkParams)
      if (existingContacts && existingContacts.length > 0) {
        // Ya existe un contacto para esta combinación
        const existingContact = existingContacts[0]
        const statusText = {
          'pending': 'PENDIENTE',
          'in_progress': 'EN PROGRESO',
          'resolved': 'RESUELTO',
          'cancelled': 'CANCELADO'
        }[existingContact.con_status] || existingContact.con_status.toUpperCase()
        const entityType = activityId ? 'ACTIVIDAD' : 'USUARIO'
        const entityId = activityId || userId
        throw new Error(`YA EXISTE UN CONTACTO (${statusText}) PARA ESTA ${entityType} (ID: ${entityId}) EN ESTE PERIODO`)
      }
      // Si no existe un duplicado, crear el nuevo contacto
      const insertQuery = `
        INSERT INTO contact
        (con_user_id, con_admin_id, con_period_id, con_activity_id, con_description, con_last_admin_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const result = await db.query(insertQuery, [userId, adminId, periodId, activityId || null, description, lastAdminId || adminId])
      if (!result || !result.insertId) {
        throw new Error('NO SE PUDO CREAR EL CONTACTO')
      }
      return result.insertId
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL CREAR EL CONTACTO')
    }
  }
}

module.exports = Contact