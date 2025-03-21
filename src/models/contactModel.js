const db = require('../config/mysql')
const IContact = require('../interfaces/IPeriod')

class Contact extends IContact {
	constructor(id, userId, adminId, periodId, activityId, collectiveId, description, observations, status, createdAt, updatedAt) {
		super()
		this.id = id
    this.userId = userId
    this.adminId = adminId
    this.periodId = periodId
    this.activityId = activityId
    this.collectiveId = collectiveId
    this.description = description
    this.observations = observations
    this.status = status
    this.createdAt = createdAt
    this.updatedAt = updatedAt
	}

  static async getContactsByPeriod(periodId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      }

      const query = `
        SELECT 
          c.con_id, 
          c.con_description, 
          c.con_observations, 
          c.con_status, 
          c.con_created_at, 
          c.con_updated_at,
          
          -- Datos del usuario
          u.use_id,
          u.use_nua,
          u.use_name AS user_name,
          u.use_last_name AS user_last_name,
          u.use_second_last_name AS user_second_last_name,
          u.use_phone,
          u.use_email,
          
          -- Datos del administrador
          a.adm_id,
          a.adm_name AS admin_name,
          
          -- Datos del periodo
          p.per_id,
          p.per_name AS period_name,
          
          -- Datos de actividad (si existe)
          ac.act_id,
          ac.act_name,
          ac.act_description,
          
          -- Datos de colectivo (si existe)
          col.col_id,
          col.col_event,
          col.col_place
          
        FROM contact c
        
        -- Joins para obtener datos relacionados
        INNER JOIN users u ON c.con_user_id = u.use_id
        INNER JOIN admins a ON c.con_admin_id = a.adm_id
        INNER JOIN periods p ON c.con_period_id = p.per_id
        LEFT JOIN activities ac ON c.con_activity_id = ac.act_id
        LEFT JOIN collectives col ON c.con_collective_id = col.col_id
        
        WHERE c.con_period_id = ?
        
        ORDER BY 
          CASE c.con_status
            WHEN 'pending' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'resolved' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          c.con_created_at DESC
      `
      
      const contacts = await db.query(query, [periodId])
      
      if (!contacts || contacts.length === 0) {
        return []
      }
      
      return contacts.map(contact => {
        const userFullName = `${contact.user_name} ${contact.user_last_name} ${contact.user_second_last_name || ''}`.trim()
        
        let relatedItem = null
        if (contact.act_id) {
          relatedItem = {
            type: 'activity',
            id: contact.act_id,
            name: contact.act_name,
            description: contact.act_description
          }
        } else if (contact.col_id) {
          relatedItem = {
            type: 'collective',
            id: contact.col_id,
            name: contact.col_event,
            // Usar col_place en lugar de col_description que no existe
            description: `Lugar: ${contact.col_place || 'No especificado'}`
          }
        }
        
        contact.con_created_at = new Date(contact.con_created_at).toISOString().split('T')[0]
        contact.con_updated_at = new Date(contact.con_updated_at).toISOString().split('T')[0]

        return {
          id: contact.con_id,
          description: contact.con_description,
          observations: contact.con_observations,
          status: contact.con_status,
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
            name: contact.admin_name
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

  static async getAllContactsWithDetails() {
    try {
      const query = `
        SELECT 
          c.con_id, 
          c.con_description, 
          c.con_observations, 
          c.con_status, 
          c.con_created_at, 
          c.con_updated_at,
          
          -- Datos del usuario
          u.use_id,
          u.use_nua,
          u.use_name AS user_name,
          u.use_last_name AS user_last_name,
          u.use_second_last_name AS user_second_last_name,
          u.use_phone,
          u.use_email,
          
          -- Datos del administrador
          a.adm_id,
          a.adm_name AS admin_name,
          
          -- Datos de actividad (si existe)
          ac.act_id,
          ac.act_name,
          ac.act_description,
          
          -- Datos de colectivo (si existe)
          col.col_id,
          col.col_event,
          col.col_place
          
        FROM contact c
        
        -- Joins para obtener datos relacionados
        INNER JOIN users u ON c.con_user_id = u.use_id
        INNER JOIN admins a ON c.con_admin_id = a.adm_id
        LEFT JOIN activities ac ON c.con_activity_id = ac.act_id
        LEFT JOIN collectives col ON c.con_collective_id = col.col_id
        
        ORDER BY 
          CASE c.con_status
            WHEN 'pending' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'resolved' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          c.con_created_at DESC
      `
      
      const contacts = await db.query(query)
      
      return contacts.map(contact => {
        const userFullName = `${contact.user_name} ${contact.user_last_name} ${contact.user_second_last_name || ''}`.trim()
        
        let relatedItem = null
        if (contact.act_id) {
          relatedItem = {
            type: 'activity',
            id: contact.act_id,
            name: contact.act_name,
            description: contact.act_description
          }
        } else if (contact.col_id) {
          relatedItem = {
            type: 'collective',
            id: contact.col_id,
            name: contact.col_event,
            // Usar col_place en lugar de col_description
            description: `Lugar: ${contact.col_place || 'No especificado'}`
          }
        }
        
        return {
          id: contact.con_id,
          description: contact.con_description,
          observations: contact.con_observations,
          status: contact.con_status,
          createdAt: contact.con_created_at,
          updatedAt: contact.con_updated_at,
          user: {
            id: contact.use_id,
            nua: contact.use_nua,
            name: userFullName,
            phone: contact.use_phone,
            email: contact.use_email
          },
          admin: {
            id: contact.adm_id,
            name: contact.admin_name
          },
          relatedItem
        }
      })
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error('ERROR AL OBTENER LOS CONTACTOS')
    }
  }
  
  static async getContactById(id) {
    try {
      const query = `
        SELECT 
          c.con_id, 
          c.con_description, 
          c.con_observations, 
          c.con_status, 
          c.con_created_at, 
          c.con_updated_at,
          
          -- Datos del usuario
          u.use_id,
          u.use_nua,
          u.use_name AS user_name,
          u.use_last_name AS user_last_name,
          u.use_second_last_name AS user_second_last_name,
          u.use_phone,
          u.use_email,
          
          -- Datos del administrador
          a.adm_id,
          a.adm_name AS admin_name,
          
          -- Datos de actividad (si existe)
          ac.act_id,
          ac.act_name,
          ac.act_description,
          
          -- Datos de colectivo (si existe)
          col.col_id,
          col.col_event,
          col.col_place
          
        FROM contact c
        
        -- Joins para obtener datos relacionados
        INNER JOIN users u ON c.con_user_id = u.use_id
        INNER JOIN admins a ON c.con_admin_id = a.adm_id
        LEFT JOIN activities ac ON c.con_activity_id = ac.act_id
        LEFT JOIN collectives col ON c.con_collective_id = col.col_id
        
        WHERE c.con_id = ?
      `
      
      const [contact] = await db.query(query, [id])
      
      if (!contact) {
        throw new Error(`NO SE ENCONTRÓ UN CONTACTO CON ID: ${id}`)
      }
      
      const userFullName = `${contact.user_name} ${contact.user_last_name} ${contact.user_second_last_name || ''}`.trim()
      
      let relatedItem = null
      if (contact.act_id) {
        relatedItem = {
          type: 'activity',
          id: contact.act_id,
          name: contact.act_name,
          description: contact.act_description
        }
      } else if (contact.col_id) {
        relatedItem = {
          type: 'collective',
          id: contact.col_id,
          name: contact.col_event,
          // Usar col_place en lugar de col_description
          description: `Lugar: ${contact.col_place || 'No especificado'}`
        }
      }
      
      return {
        id: contact.con_id,
        description: contact.con_description,
        observations: contact.con_observations,
        status: contact.con_status,
        createdAt: contact.con_created_at,
        updatedAt: contact.con_updated_at,
        user: {
          id: contact.use_id,
          nua: contact.use_nua,
          name: userFullName,
          phone: contact.use_phone,
          email: contact.use_email
        },
        admin: {
          id: contact.adm_id,
          name: contact.admin_name
        },
        relatedItem
      }
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL CONTACTO')
    }
  }

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

  static async updateContact(id, observations, status) {
    try {
      const query = `
        UPDATE contact
        SET con_observations = ?, con_status = ?
        WHERE con_id = ?
      `
      await db.query(query, [observations, status, id])
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL CONTACTO')
    }
  }
}

module.exports = Contact