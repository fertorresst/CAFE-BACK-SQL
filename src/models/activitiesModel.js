const db = require("../config/mysql")
const IActivities = require("../interfaces/IActivities")

class Activities extends IActivities {
  /**
   * Constructor de la clase Activities
   */
  constructor(id, name, dateStart, dateEnd, hours, institution, evidence, area, status, observations, lastAdminId, userId, periodId, createdAt, updatedAt) {
    super()
    this.id = id
    this.name = name
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.hours = hours
    this.institution = institution
    this.evidence = evidence
    this.area = area
    this.status = status
    this.observations = observations
    this.lastAdminId = lastAdminId
    this.userId = userId
    this.periodId = periodId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Crea una nueva actividad individual
   * @param {Object} data - Datos de la actividad
   * @returns {Promise<boolean>}
   */
  static async createActivity(data) {
    const insertQuery = `
      INSERT INTO activities (
        act_name, act_date_start, act_date_end, act_hours, act_institution,
        act_evidence, act_area, act_status, act_observations, act_last_admin_id,
        act_user_id, act_period_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await db.query(insertQuery, [
      data.name,
      data.dateStart,
      data.dateEnd,
      data.hours,
      data.institution,
      data.evidence,
      data.area,
      data.status,
      data.observations,
      data.lastAdminId,
      data.userId,
      data.periodId
    ])
    return true
  }

  /**
   * Obtiene todas las actividades de un periodo agrupadas por usuario
   * @param {number} periodId
   * @returns {Promise<Array>}
   */
  static async getActivitiesByPeriod(periodId) {
    try {
      if (!periodId) throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')

      const usersQuery = `
        SELECT DISTINCT
          u.use_id,
          u.use_nua,
          u.use_name,
          u.use_last_name,
          u.use_second_last_name,
          u.use_career,
          u.use_email,
          u.use_phone
        FROM users u
        INNER JOIN activities a ON u.use_id = a.act_user_id
        WHERE a.act_period_id = ?
        ORDER BY u.use_last_name, u.use_name
      `
      const users = await db.query(usersQuery, [periodId])
      const allActivities = []

      for (const user of users) {
        const fullName = `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim()
        const activitiesQuery = `
          SELECT
            a.act_id,
            a.act_name,
            a.act_area,
            a.act_date_start,
            a.act_date_end,
            a.act_hours,
            a.act_institution,
            a.act_status,
            a.act_observations,
            a.act_evidence,
            a.act_last_admin_id,
            a.act_created_at,
            a.act_updated_at
          FROM activities a
          WHERE a.act_user_id = ? AND a.act_period_id = ?
          ORDER BY a.act_date_start DESC
        `
        const userActivities = await db.query(activitiesQuery, [user.use_id, periodId])
        const formattedActivities = userActivities.map(activity => {
          let evidenceLinks = []
          if (activity.act_evidence) {
            try {
              const evidence = JSON.parse(activity.act_evidence.toString())
              if (typeof evidence === 'object') {
                evidenceLinks = Object.values(evidence).flat().filter(item => item)
              }
            } catch (error) {
              console.error('Error al parsear JSON de evidencias:', error)
            }
          }
          return {
            id: activity.act_id,
            name: activity.act_name,
            area: activity.act_area,
            startDate: new Date(activity.act_date_start).toISOString().split('T')[0],
            endDate: new Date(activity.act_date_end).toISOString().split('T')[0],
            hours: activity.act_hours,
            institution: activity.act_institution,
            status: activity.act_status,
            observations: activity.act_observations,
            lastAdminId: activity.act_last_admin_id,
            createdAt: new Date(activity.act_created_at).toLocaleString().split(',')[0],
            updatedAt: new Date(activity.act_updated_at).toLocaleString().split(',')[0],
            evidenceLinks
          }
        })
        if (formattedActivities.length > 0) {
          allActivities.push({
            id: user.use_id,
            nua: user.use_nua,
            fullName,
            career: user.use_career,
            email: user.use_email,
            phone: user.use_phone,
            activities: formattedActivities
          })
        }
      }
      return allActivities
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LAS ACTIVIDADES DEL PERIODO')
    }
  }

  /**
   * Actualiza el estado y observaciones de una actividad
   * @param {number} activityId
   * @param {string} status
   * @param {string} observations
   * @param {number} lastAdminId
   * @returns {Promise<boolean>}
   */
  static async updateActivityStatus(activityId, status, observations, lastAdminId) {
    try {
      if (!activityId) throw new Error('SE REQUIERE UN ID DE ACTIVIDAD VÁLIDO')
      const validStatuses = ['approval', 'pending', 'rejected', 'contacted']
      if (!validStatuses.includes(status)) {
        throw new Error(`ESTADO INVÁLIDO. DEBE SER UNO DE: ${validStatuses.join(', ')}`)
      }
      const checkQuery = 'SELECT act_id FROM activities WHERE act_id = ?'
      const [activity] = await db.query(checkQuery, [activityId])
      if (!activity) throw new Error(`NO SE ENCONTRÓ UNA ACTIVIDAD CON ID: ${activityId}`)

      const updateQuery = `
        UPDATE activities
        SET act_status = ?, act_observations = ?, act_last_admin_id = ?, act_updated_at = CURRENT_TIMESTAMP
        WHERE act_id = ?
      `
      const result = await db.query(updateQuery, [status, observations, lastAdminId, activityId])
      if (result.affectedRows === 0) throw new Error('NO SE PUDO ACTUALIZAR LA ACTIVIDAD')
      return true
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL ESTADO DE LA ACTIVIDAD')
    }
  }

  /**
   * Actualiza los datos de una actividad individual
   * @param {number} activityId
   * @param {Object} activityData
   * @returns {Promise<boolean>}
   */
  static async updateActivity(activityId, activityData) {
    try {
      if (!activityId) throw new Error('SE REQUIERE UN ID DE ACTIVIDAD VÁLIDO')
      if (!activityData || Object.keys(activityData).length === 0) {
        throw new Error('SE REQUIEREN DATOS PARA ACTUALIZAR LA ACTIVIDAD')
      }
      const checkQuery = 'SELECT act_id FROM activities WHERE act_id = ?'
      const [activity] = await db.query(checkQuery, [activityId])
      if (!activity) throw new Error(`NO SE ENCONTRÓ UNA ACTIVIDAD CON ID: ${activityId}`)

      // Campos permitidos para actualización
      const allowedFields = [
        'name', 'dateStart', 'dateEnd', 'hours', 'institution', 'evidence', 'area', 'status', 'observations', 'lastAdminId'
      ]
      const updateFields = []
      const updateValues = []
      const fieldMapping = {
        name: 'act_name',
        dateStart: 'act_date_start',
        dateEnd: 'act_date_end',
        hours: 'act_hours',
        institution: 'act_institution',
        evidence: 'act_evidence',
        area: 'act_area',
        status: 'act_status',
        observations: 'act_observations',
        lastAdminId: 'act_last_admin_id'
      }

      // Validaciones específicas
      if (activityData.status) {
        const validStatuses = ['approval', 'pending', 'rejected', 'contacted']
        if (!validStatuses.includes(activityData.status)) {
          throw new Error(`ESTADO INVÁLIDO. DEBE SER UNO DE: ${validStatuses.join(', ')}`)
        }
      }
      if (activityData.area) {
        const validAreas = ['DP', 'RS', 'CEE', 'FCI', 'AC']
        if (!validAreas.includes(activityData.area)) {
          throw new Error(`ÁREA INVÁLIDA. DEBE SER UNA DE: ${validAreas.join(', ')}`)
        }
      }
      if (activityData.dateStart && activityData.dateEnd) {
        const startDate = new Date(activityData.dateStart)
        const endDate = new Date(activityData.dateEnd)
        if (startDate > endDate) {
          throw new Error('LA FECHA DE INICIO NO PUEDE SER POSTERIOR A LA FECHA DE FINALIZACIÓN')
        }
      }

      // Procesar y preparar los campos a actualizar
      for (const field of allowedFields) {
        if (field in activityData) {
          const dbField = fieldMapping[field]
          let value = activityData[field]
          if (field === 'evidence' && typeof value === 'object') {
            value = JSON.stringify(value)
          }
          updateFields.push(`${dbField} = ?`)
          updateValues.push(value)
        }
      }
      if (updateFields.length === 0) throw new Error('NO SE PROPORCIONARON CAMPOS VÁLIDOS PARA ACTUALIZAR')
      updateFields.push('act_updated_at = CURRENT_TIMESTAMP')
      const updateQuery = `
        UPDATE activities
        SET ${updateFields.join(', ')}
        WHERE act_id = ?
      `
      updateValues.push(activityId)
      const result = await db.query(updateQuery, updateValues)
      if (result.affectedRows === 0) throw new Error('NO SE PUDO ACTUALIZAR LA ACTIVIDAD')
      return true
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR LA ACTIVIDAD')
    }
  }

  /**
   * Obtiene todas las actividades de un usuario agrupadas por periodo
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  static async getActivitiesByUserId(userId) {
    try {
      if (!userId) throw new Error('SE REQUIERE UN ID DE USUARIO VÁLIDO')
      const userQuery = `SELECT * FROM users WHERE use_id = ?`
      const [user] = await db.query(userQuery, [userId])
      if (!user) throw new Error(`NO SE ENCONTRÓ UN USUARIO CON ID: ${userId}`)

      const activitiesQuery = `
        SELECT
          a.act_id,
          a.act_name,
          a.act_area,
          a.act_date_start,
          a.act_date_end,
          a.act_hours,
          a.act_institution,
          a.act_status,
          a.act_observations,
          a.act_evidence,
          a.act_last_admin_id,
          a.act_created_at,
          a.act_updated_at,
          a.act_period_id,
          p.per_id,
          p.per_name,
          p.per_date_start,
          p.per_date_end,
          p.per_status
        FROM activities a
        INNER JOIN periods p ON a.act_period_id = p.per_id
        WHERE a.act_user_id = ?
        ORDER BY p.per_date_start DESC, a.act_date_start DESC
      `
      const userActivities = await db.query(activitiesQuery, [userId])
      const periodsMap = new Map()
      userActivities.forEach(activity => {
        const periodId = activity.per_id
        if (!periodsMap.has(periodId)) {
          periodsMap.set(periodId, {
            id: periodId,
            name: activity.per_name,
            dateStart: new Date(activity.per_date_start).toISOString().split('T')[0],
            dateEnd: new Date(activity.per_date_end).toISOString().split('T')[0],
            status: activity.per_status,
            activities: []
          })
        }
        let evidenceLinks = []
        if (activity.act_evidence) {
          try {
            const evidence = JSON.parse(activity.act_evidence.toString())
            if (typeof evidence === 'object') {
              evidenceLinks = Object.values(evidence).flat().filter(item => item)
            }
          } catch (error) {
            console.error('Error al parsear JSON de evidencias:', error)
          }
        }
        periodsMap.get(periodId).activities.push({
          id: activity.act_id,
          name: activity.act_name,
          area: activity.act_area,
          startDate: new Date(activity.act_date_start).toISOString().split('T')[0],
          endDate: new Date(activity.act_date_end).toISOString().split('T')[0],
          hours: activity.act_hours,
          institution: activity.act_institution,
          status: activity.act_status,
          observations: activity.act_observations,
          lastAdminId: activity.act_last_admin_id,
          createdAt: new Date(activity.act_created_at).toLocaleString('es-MX').split(',')[0],
          updatedAt: new Date(activity.act_updated_at).toLocaleString('es-MX').split(',')[0],
          evidenceLinks
        })
      })
      return { periods: Array.from(periodsMap.values()) }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LAS ACTIVIDADES DEL USUARIO')
    }
  }

  /**
   * Elimina una actividad por su ID (solo si el periodo está activo)
   * @param {number} activityId
   * @returns {Promise<boolean>}
   */
  static async deleteActivity(activityId) {
    try {
      if (!activityId) throw new Error('SE REQUIERE UN ID DE ACTIVIDAD VÁLIDO')
      const checkQuery = `
        SELECT a.act_id, p.per_status 
        FROM activities a
        INNER JOIN periods p ON a.act_period_id = p.per_id
        WHERE a.act_id = ?
      `
      const [activityInfo] = await db.query(checkQuery, [activityId])
      if (!activityInfo) throw new Error(`NO SE ENCONTRÓ UNA ACTIVIDAD CON ID: ${activityId}`)
      if (activityInfo.per_status !== 'active') {
        throw new Error('NO SE PUEDE ELIMINAR LA ACTIVIDAD: EL PERIODO NO ESTÁ ACTIVO')
      }
      const deleteQuery = 'DELETE FROM activities WHERE act_id = ?'
      const result = await db.query(deleteQuery, [activityId])
      if (result.affectedRows === 0) throw new Error('NO SE PUDO ELIMINAR LA ACTIVIDAD')
      return true
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ELIMINAR LA ACTIVIDAD')
    }
  }

  /**
   * Obtiene una actividad por su ID (sin formatear)
   * @param {number} activityId
   * @returns {Promise<Object[]>}
   */
  static async getActivityRaw(activityId) {
    const query = 'SELECT * FROM activities WHERE act_id = ?'
    return db.query(query, [activityId])
  }

  /**
   * Actualiza solo el campo de evidencias de una actividad
   * @param {number} activityId
   * @param {Object} evidence - Objeto de evidencias (se guarda como JSON)
   * @returns {Promise<boolean>}
   */
  static async updateActivityEvidence(activityId, evidence) {
    const updateQuery = `
      UPDATE activities
      SET act_evidence = ?, act_updated_at = CURRENT_TIMESTAMP
      WHERE act_id = ?
    `
    const result = await db.query(updateQuery, [JSON.stringify(evidence), activityId])
    return result.affectedRows > 0
  }
}

module.exports = Activities
