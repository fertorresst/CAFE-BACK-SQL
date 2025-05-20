const db = require('../config/mysql')
const IPeriod = require('../interfaces/IPeriod')

/**
 * Clase para gestionar periodos en el sistema
 * @extends IPeriod
 */
class Period extends IPeriod {
  /**
   * Constructor de la clase Period
   * @param {number} id - ID único del periodo
   * @param {string} name - Nombre del periodo
   * @param {string} dateStart - Fecha de inicio (YYYY-MM-DD)
   * @param {string} dateEnd - Fecha de fin (YYYY-MM-DD)
   * @param {boolean} exclusive - Si el periodo es exclusivo
   * @param {string} status - Estado del periodo ('active', 'pending', 'ended')
   * @param {number} createAdminId - ID del administrador que creó el periodo
   * @param {string} createdAt - Fecha de creación
   * @param {string} updatedAt - Fecha de última actualización
   */
  constructor(id, name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updatedAt) {
    super()
    this.id = id
    this.name = name
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.exclusive = exclusive
    this.status = status
    this.createAdminId = createAdminId
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Obtiene todos los periodos con sus estadísticas de actividades
   * @returns {Promise<Array>} Lista de periodos con estadísticas
   */
  static async getAllPeriods() {
    try {
      const periodsQuery = 'SELECT * FROM periods'
      const periods = await db.query(periodsQuery)
      for (const period of periods) {
        period.per_date_start = new Date(period.per_date_start).toISOString().split('T')[0]
        period.per_date_end = new Date(period.per_date_end).toISOString().split('T')[0]
        period.per_created_at = new Date(period.per_created_at).toISOString().split('T')[0]
        period.per_updated_at = new Date(period.per_updated_at).toISOString().split('T')[0]
        const activitiesStatsQuery = `
          SELECT 
            COUNT(*) as total_activities,
            SUM(CASE WHEN act_status = 'approval' THEN 1 ELSE 0 END) as approved_activities,
            SUM(CASE WHEN act_status = 'pending' THEN 1 ELSE 0 END) as pending_activities,
            SUM(CASE WHEN act_status = 'rejected' THEN 1 ELSE 0 END) as rejected_activities
          FROM activities
          WHERE act_period_id = ?
        `
        const [activityStats] = await db.query(activitiesStatsQuery, [period.per_id])
        period.activity_stats = {
          total: Number(activityStats.total_activities) || 0,
          approved: Number(activityStats.approved_activities) || 0,
          pending: Number(activityStats.pending_activities) || 0,
          rejected: Number(activityStats.rejected_activities) || 0
        }
        period.total_records = period.activity_stats.total
        period.total_approved = period.activity_stats.approved
        period.total_pending = period.activity_stats.pending
        period.total_rejected = period.activity_stats.rejected
      }
      return periods
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error('ERROR AL OBTENER LOS PERIODOS')
    }
  }

  /**
   * Obtiene información detallada de un periodo específico
   * @param {number} id - ID del periodo a consultar
   * @returns {Promise<Object>} Información del periodo
   */
  static async getPeriodInfo(id) {
    try {
      if (!id) throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      if (isNaN(id)) throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      const periodQuery = 'SELECT * FROM periods WHERE per_id = ?'
      const periodResult = await db.query(periodQuery, [id])
      if (!periodResult || periodResult.length === 0) throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${id}`)
      const period = periodResult[0]
      period.per_date_start = new Date(period.per_date_start).toISOString().split('T')[0]
      period.per_date_end = new Date(period.per_date_end).toISOString().split('T')[0]
      period.per_created_at = new Date(period.per_created_at).toISOString().split('T')[0]
      period.per_updated_at = new Date(period.per_updated_at).toISOString().split('T')[0]
      return period
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL PERIODO')
    }
  }

  /**
   * Crea un nuevo periodo en el sistema
   * @param {string} name - Nombre del periodo
   * @param {string} dateStart - Fecha de inicio (YYYY-MM-DD)
   * @param {string} dateEnd - Fecha de fin (YYYY-MM-DD)
   * @param {boolean} exclusive - Si el periodo es exclusivo
   * @param {string} status - Estado inicial del periodo
   * @param {number} createAdminId - ID del administrador que crea el periodo
   * @returns {Promise<Period>} Objeto Period con los datos del nuevo periodo
   */
  static async createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId) {
    try {
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)
      if (isNaN(newStartDate) || isNaN(newEndDate)) throw new Error('LAS FECHAS ESTÁN VACÍAS O SON INVÁLIDAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
      if (newStartDate >= newEndDate) throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
      const nameCheckQuery = 'SELECT per_id FROM periods WHERE per_name = ?'
      const nameCheck = await db.query(nameCheckQuery, [name])
      if (nameCheck && nameCheck.length > 0) throw new Error('YA EXISTE UN PERIODO CON ESTE NOMBRE')
      const query = `
        SELECT per_id, per_name, per_date_start, per_date_end 
        FROM periods 
        WHERE (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start >= ? AND per_date_end <= ?)
      `
      const existingPeriods = await db.query(query, [
        newEndDate, newStartDate,
        newEndDate, newEndDate,
        newStartDate, newEndDate
      ])
      if (existingPeriods && existingPeriods.length > 0) {
        const conflictingPeriod = existingPeriods[0]
        throw new Error(`EL PERIODO SE SOLAPA CON EL PERIODO EXISTENTE: ${conflictingPeriod.per_name} (${conflictingPeriod.per_date_start.toISOString().split('T')[0]} - ${conflictingPeriod.per_date_end.toISOString().split('T')[0]})`)
      }
      const insertQuery = `
        INSERT INTO periods 
        (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const result = await db.query(insertQuery, [
        name, dateStart, dateEnd, exclusive, status, createAdminId
      ])
      const id = result.insertId
      return new Period(id, name, dateStart, dateEnd, exclusive, status, createAdminId)
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL CREAR EL PERIODO')
    }
  }

  /**
   * Elimina un periodo del sistema
   * @param {number} id - ID del periodo a eliminar
   */
  static async deletePeriod(id) {
    try {
      const query = 'DELETE FROM periods WHERE per_id = ?'
      await db.query(query, [id])
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ELIMINAR EL PERIODO')
    }
  }

  /**
   * Actualiza las fechas de inicio y fin de un periodo
   * @param {number} id - ID del periodo a actualizar
   * @param {string} dateStart - Nueva fecha de inicio (YYYY-MM-DD)
   * @param {string} dateEnd - Nueva fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Period>} Objeto Period con los datos actualizados
   */
  static async updateDates(id, dateStart, dateEnd) {
    try {
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)
      if (isNaN(newStartDate) || isNaN(newEndDate)) throw new Error('FECHAS INVÁLIDAS O VACÍAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
      if (newStartDate >= newEndDate) throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
      const query = `
        SELECT per_id, per_name, per_date_start, per_date_end 
        FROM periods 
        WHERE (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start >= ? AND per_date_end <= ?)
      `
      const existingPeriods = await db.query(query, [
        newEndDate, newStartDate,
        newEndDate, newEndDate,
        newStartDate, newEndDate
      ])
      if (existingPeriods && existingPeriods.length > 0 && existingPeriods[0].per_id !== id) {
        const conflictingPeriod = existingPeriods[0]
        throw new Error(`EL PERIODO SE SOLAPA CON EL PERIODO EXISTENTE: ${conflictingPeriod.per_name} (${conflictingPeriod.per_date_start.toISOString().split('T')[0]} - ${conflictingPeriod.per_date_end.toISOString().split('T')[0]})`)
      }
      const updateQuery = `
        UPDATE periods 
        SET per_date_start = ?, per_date_end = ?
        WHERE per_id = ?
      `
      await db.query(updateQuery, [dateStart, dateEnd, id])
      return new Period(id, dateStart, dateEnd)
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR LAS FECHAS DEL PERIODO')
    }
  }

  /**
   * Actualiza el estado de un periodo
   * @param {number} id - ID del periodo a actualizar
   * @param {string} status - Nuevo estado ('active', 'pending', 'ended')
   * @returns {Promise<Period>} Objeto Period con el estado actualizado
   */
  static async updateStatus(id, status) {
    try {
      if (!['active', 'pending', 'ended'].includes(status)) {
        throw new Error(`LOS ESTADOS PERMITIDOS SON 'active', 'pending' y 'ended'`)
      }
      const query = `
        SELECT per_id, per_status 
        FROM periods
        WHERE per_id = ? AND per_status = ?
      `
      const checkStatus = await db.query(query, [id, status])
      if (checkStatus && checkStatus.length > 0) {
        throw new Error(`NO HA SIDO POSIBLE ACTUALIZAR EL PERIODO ${id} YA QUE SU ESTADO ES EL MISMO AL QUE SE QUIERE ACTUALIZAR ${status}`)
      }
      const updateQuery = `
        UPDATE periods 
        SET per_status = ?
        WHERE per_id = ?
      `
      await db.query(updateQuery, [status, id])
      return new Period(id, status)
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL ESTADO DEL PERIODO')
    }
  }

  /**
   * Obtiene todas las actividades de un periodo específico
   * @param {number} periodId - ID del periodo
   * @returns {Promise<Object>} Objeto con las actividades del periodo
   */
  static async getAllPeriodActivities(periodId) {
    try {
      if (!periodId) throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      if (isNaN(periodId)) throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      const activitiesQuery = `
        SELECT * FROM activities 
        WHERE act_period_id = ?
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      return {
        periodId,
        activities: activitiesResult
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LAS ACTIVIDADES DEL PERIODO')
    }
  }

  /**
   * Obtiene conteos de actividades por área para un periodo específico
   * @param {number} periodId - ID del periodo
   * @returns {Promise<Object>} Objeto con los conteos por área
   */
  static async getAreaCountsByPeriodId(periodId) {
    try {
      if (!periodId) throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      const areaCounts = {
        DP: 0,
        RS: 0,
        CEE: 0,
        FCI: 0,
        AC: 0,
        total: 0
      }
      const activitiesQuery = `
        SELECT act_area, COUNT(*) as count 
        FROM activities 
        WHERE act_period_id = ? 
        GROUP BY act_area
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      if (activitiesResult && activitiesResult.length > 0) {
        activitiesResult.forEach(row => {
          const area = row.act_area
          const count = Number(row.count)
          if (area in areaCounts) {
            areaCounts[area] += count
            areaCounts.total += count
          }
        })
      }
      const periodQuery = 'SELECT per_name FROM periods WHERE per_id = ?'
      const periodResult = await db.query(periodQuery, [periodId])
      if (!periodResult || periodResult.length === 0) {
        throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${periodId}`)
      }
      return {
        periodId,
        periodName: periodResult[0].per_name,
        areaCounts
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS CONTEOS POR ÁREA')
    }
  }

  /**
   * Obtiene la información completa de un periodo para su descarga
   * @param {number} periodId - ID del periodo
   * @returns {Promise<Object>} Objeto con toda la información del periodo y sus actividades
   */
  static async getPeriodForDownload(periodId) {
    try {
      if (!periodId) throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      if (isNaN(periodId)) throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      const periodQuery = `
        SELECT * FROM periods 
        WHERE per_id = ?
      `
      const periodResult = await db.query(periodQuery, [periodId])
      if (!periodResult || periodResult.length === 0) {
        throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${periodId}`)
      }
      const period = periodResult[0]
      if (period.per_status !== 'ended') {
        throw new Error('EL PERIODO DEBE ESTAR FINALIZADO PARA PODER DESCARGARLO')
      }
      const activitiesQuery = `
        SELECT * FROM activities 
        WHERE act_period_id = ?
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      return {
        periodId,
        periodName: period.per_name,
        periodStartDate: period.per_date_start,
        periodEndDate: period.per_date_end,
        periodExclusive: period.per_exclusive,
        periodStatus: period.per_status,
        periodCreateAdminId: period.per_create_admin_id,
        activities: activitiesResult
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL PERIODO PARA DESCARGA')
    }
  }
}

module.exports = Period