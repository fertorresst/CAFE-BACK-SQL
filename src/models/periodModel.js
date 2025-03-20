const db = require('../config/mysql')
const IPeriod = require('../interfaces/IPeriod')

class Period extends IPeriod {
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

  static async getAllPeriods() {
    try {
      // Consulta principal para obtener todos los periodos
      const periodsQuery = 'SELECT * FROM periods'
      const periods = await db.query(periodsQuery)
      
      // Para cada periodo, consultamos las estadísticas de actividades
      for (const period of periods) {
        // Formateamos las fechas
        period.per_date_start = new Date(period.per_date_start).toISOString().split('T')[0]
        period.per_date_end = new Date(period.per_date_end).toISOString().split('T')[0]
        period.per_created_at = new Date(period.per_created_at).toISOString().split('T')[0]
        period.per_updated_at = new Date(period.per_updated_at).toISOString().split('T')[0]
        
        // Consulta de estadísticas de actividades
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
        
        // Consulta de estadísticas de colectivos
        const collectivesStatsQuery = `
          SELECT 
            COUNT(*) as total_collectives,
            SUM(CASE WHEN col_status = 'approval' THEN 1 ELSE 0 END) as approved_collectives,
            SUM(CASE WHEN col_status = 'pending' THEN 1 ELSE 0 END) as pending_collectives,
            SUM(CASE WHEN col_status = 'rejected' THEN 1 ELSE 0 END) as rejected_collectives
          FROM collectives
          WHERE col_period_id = ?
        `
        const [collectiveStats] = await db.query(collectivesStatsQuery, [period.per_id])
        
        // Añadimos las estadísticas al objeto periodo
        period.activity_stats = {
          total: Number(activityStats.total_activities) || 0,
          approved: Number(activityStats.approved_activities) || 0,
          pending: Number(activityStats.pending_activities) || 0,
          rejected: Number(activityStats.rejected_activities) || 0
        }
        
        period.collective_stats = {
          total: Number(collectiveStats.total_collectives) || 0,
          approved: Number(collectiveStats.approved_collectives) || 0,
          pending: Number(collectiveStats.pending_collectives) || 0,
          rejected: Number(collectiveStats.rejected_collectives) || 0
        }
        
        // Total combinado de ambas categorías
        period.total_records = period.activity_stats.total + period.collective_stats.total
        period.total_approved = period.activity_stats.approved + period.collective_stats.approved
        period.total_pending = period.activity_stats.pending + period.collective_stats.pending
        period.total_rejected = period.activity_stats.rejected + period.collective_stats.rejected
      }
      
      return periods
    }
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error('ERROR AL OBTENER LOS PERIODOS')
    }
  }

  static async getPeriodInfo(id) {
    try {
      if (!id) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      } else if (isNaN(id)) {
        throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      }

      // Consulta principal para obtener el periodo
      const periodQuery = 'SELECT * FROM periods WHERE per_id = ?'
      const periodResult = await db.query(periodQuery, [id])

      if (!periodResult || periodResult.length === 0) {
        throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${id}`)
      }

      const period = periodResult[0]
      period.per_date_start = new Date(period.per_date_start).toISOString().split('T')[0] // Formatear fecha de inicio
      period.per_date_end = new Date(period.per_date_end).toISOString().split('T')[0] // Formatear fecha de fin
      period.per_created_at = new Date(period.per_created_at).toISOString().split('T')[0] // Formatear fecha de creación
      period.per_updated_at = new Date(period.per_updated_at).toISOString().split('T')[0] // Formatear fecha de actualización

      return period
    }
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL PERIODO')
    }
  }

  static async createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId) {
    try {
      // Validar que las fechas sean válidas primero
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)

      // Verificar que las fechas son válidas
      if (isNaN(newStartDate) || isNaN(newEndDate)) {
        throw new Error('LAS FECHAS ESTÁN VACÍAS O SON INVÁLIDAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
      }

      // Verificar que la fecha de inicio es anterior a la fecha de fin
      if (newStartDate >= newEndDate) {
        throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
      }

      // Verificar primero si ya existe un periodo con el mismo nombre (evitar consultas innecesarias)
      const nameCheckQuery = 'SELECT per_id FROM periods WHERE per_name = ?'
      const nameCheck = await db.query(nameCheckQuery, [name])
      if (nameCheck && nameCheck.length > 0) {
        throw new Error('YA EXISTE UN PERIODO CON ESTE NOMBRE')
      }

      // Consulta optimizada para obtener solo periodos que potencialmente se solapen
      // Esto reduce la carga en sistemas con muchos periodos
      const query = `
        SELECT per_id, per_name, per_date_start, per_date_end 
        FROM periods 
        WHERE (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start >= ? AND per_date_end <= ?)
      `
      const existingPeriods = await db.query(query, [
        newEndDate, newStartDate,     // Caso 1: Periodo existente incluye inicio del nuevo
        newEndDate, newEndDate,       // Caso 2: Periodo existente incluye fin del nuevo
        newStartDate, newEndDate      // Caso 3: Nuevo periodo contiene al existente
      ])
      
      // Si hay algún periodo que se solape, lanzar un error detallado
      if (existingPeriods && existingPeriods.length > 0) {
        const conflictingPeriod = existingPeriods[0]
        throw new Error(`EL PERIODO SE SOLAPA CON EL PERIODO EXISTENTE: ${conflictingPeriod.per_name} (${conflictingPeriod.per_date_start.toISOString().split('T')[0]} - ${conflictingPeriod.per_date_end.toISOString().split('T')[0]})`)
      }

      // Si llegamos aquí, el periodo es válido y podemos insertarlo
      const insertQuery = `
        INSERT INTO periods 
        (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `
      const result = await db.query(insertQuery, [
        name, 
        dateStart, 
        dateEnd, 
        exclusive, 
        status, 
        createAdminId
      ])
      
      const id = result.insertId
      return new Period(id, name, dateStart, dateEnd, exclusive, status, createAdminId)
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL CREAR EL PERIODO')
    }
  }

  static async deletePeriod(id) {
    try {
      const query = 'DELETE FROM periods WHERE per_id = ?'
      await db.query(query, [id])
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ELIMINAR EL PERIODO')
    }
  }
  
  static async updateDates(id, dateStart, dateEnd) {
    try {
      // Validar que las fechas sean válidas primero
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)

      // Verificar que las fechas son válidas
      if (isNaN(newStartDate) || isNaN(newEndDate)) {
        throw new Error('FECHAS INVÁLIDAS O VACÍAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
      }

      // Verificar que la fecha de inicio es anterior a la fecha de fin
      if (newStartDate >= newEndDate) {
        throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
      }

      // Consulta optimizada para obtener solo periodos que potencialmente se solapen
      // Esto reduce la carga en sistemas con muchos periodos
      const query = `
        SELECT per_id, per_name, per_date_start, per_date_end 
        FROM periods 
        WHERE (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start <= ? AND per_date_end >= ?) 
           OR (per_date_start >= ? AND per_date_end <= ?)
      `
      const existingPeriods = await db.query(query, [
        newEndDate, newStartDate,     // Caso 1: Periodo existente incluye inicio del nuevo
        newEndDate, newEndDate,       // Caso 2: Periodo existente incluye fin del nuevo
        newStartDate, newEndDate      // Caso 3: Nuevo periodo contiene al existente
      ])
      
      // Si hay algún periodo que se solape, lanzar un error detallado
      if (existingPeriods && existingPeriods.length > 0 && existingPeriods[0].per_id !== id) {
        const conflictingPeriod = existingPeriods[0]
        throw new Error(`EL PERIODO SE SOLAPA CON EL PERIODO EXISTENTE: ${conflictingPeriod.per_name} (${conflictingPeriod.per_date_start.toISOString().split('T')[0]} - ${conflictingPeriod.per_date_end.toISOString().split('T')[0]})`)
      }

      // Si llegamos aquí, el periodo es válido y podemos insertarlo
      const updateQuery = `
        UPDATE periods 
        SET per_date_start = ?, per_date_end = ?
        WHERE per_id = ?
      `
      await db.query(updateQuery, [
        dateStart, 
        dateEnd,
        id
      ])
      
      return new Period(id, dateStart, dateEnd)
    }
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR LAS FECHAS DEL PERIODO')
    }
  }

  static async updateStatus(id, status) {
    try {
      if (status !== 'active')
        if (status !== 'pending') 
          if (status !== 'ended')
            throw new Error(`LOS ESTADOS PERMITIDOS SON 'active', 'pending' y 'ended'`)

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

      await db.query(updateQuery, [
        status,
        id
      ])
      
      return new Period(id, status)
    }
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL ACTUALIZAR EL ESTADO DEL PERIODO')
    }
  }

  static async getAllPeriodActivities(periodId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      } else if (isNaN(periodId)) {
        throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      }
  
      // Consulta para obtener las actividades del periodo
      const activitiesQuery = `
        SELECT * FROM activities 
        WHERE act_period_id = ?
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      
      // Consulta para obtener los colectivos del periodo
      const collectivesQuery = `
        SELECT * FROM collectives 
        WHERE col_period_id = ?
      `
      const collectivesResult = await db.query(collectivesQuery, [periodId])
  
      // Devolver objeto con los resultados
      return {
        periodId,
        activities: activitiesResult,
        collectives: collectivesResult
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LAS ACTIVIDADES DEL PERIODO')
    }
  }

  static async getAreaCountsByPeriodId(periodId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      }
  
      // Estructura para almacenar los conteos
      const areaCounts = {
        dp: { activities: 0, collectives: 0, total: 0 },
        rs: { activities: 0, collectives: 0, total: 0 },
        cee: { activities: 0, collectives: 0, total: 0 },
        fci: { activities: 0, collectives: 0, total: 0 },
        ac: { activities: 0, collectives: 0, total: 0 },
        total: { activities: 0, collectives: 0, total: 0 }
      }
  
      // Consulta para contar actividades por área en el periodo especificado
      const activitiesQuery = `
        SELECT act_area, COUNT(*) as count 
        FROM activities 
        WHERE act_period_id = ? 
        GROUP BY act_area
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      
      // Procesar resultados de actividades
      if (activitiesResult && activitiesResult.length > 0) {
        activitiesResult.forEach(row => {
          const area = row.act_area
          const count = row.count
          
          if (areaCounts[area]) {
            areaCounts[area].activities = count
            areaCounts[area].total += count
            areaCounts.total.activities += count
            areaCounts.total.total += count
          }
        })
      }
  
      // Consulta para contar colectivos por área en el periodo especificado
      const collectivesQuery = `
        SELECT col_area, COUNT(*) as count 
        FROM collectives 
        WHERE col_period_id = ? 
        GROUP BY col_area
      `
      const collectivesResult = await db.query(collectivesQuery, [periodId])
      
      // Procesar resultados de colectivos
      if (collectivesResult && collectivesResult.length > 0) {
        collectivesResult.forEach(row => {
          const area = row.col_area
          const count = row.count
          
          if (areaCounts[area]) {
            areaCounts[area].collectives = count
            areaCounts[area].total += count
            areaCounts.total.collectives += count
            areaCounts.total.total += count
          }
        })
      }
  
      // Obtener información del periodo
      const periodQuery = 'SELECT per_name FROM periods WHERE per_id = ?'
      const periodResult = await db.query(periodQuery, [periodId])
      
      if (!periodResult || periodResult.length === 0) {
        throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${periodId}`)
      }
  
      // Devolver objeto con los resultados
      return {
        periodId,
        periodName: periodResult[0].per_name,
        areaCounts
      }
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS CONTEOS POR ÁREA')
    }
  }

  static async getPeriodForDownload(periodId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      } else if (isNaN(periodId)) {
        throw new Error('EL ID DE PERIODO DEBE SER UN NÚMERO')
      }
  
      // Consulta para obtener el periodo y sus actividades
      const periodQuery = `
        SELECT * FROM periods 
        WHERE per_id = ?
      `
      const periodResult = await db.query(periodQuery, [periodId])
      
      if (!periodResult || periodResult.length === 0) {
        throw new Error(`NO SE ENCONTRÓ UN PERIODO CON ID: ${periodId}`)
      }
  
      const period = periodResult[0]
      const periodName = period.per_name
      const periodStartDate = period.per_date_start
      const periodEndDate = period.per_date_end
      const periodExclusive = period.per_exclusive
      const periodStatus = period.per_status
      const periodCreateAdminId = period.per_create_admin_id
  
      if (periodStatus !== 'ended') {
        throw new Error('EL PERIODO DEBE ESTAR FINALIZADO PARA PODER DESCARGARLO')
      }

      // Consulta para obtener las actividades del periodo
      const activitiesQuery = `
        SELECT * FROM activities 
        WHERE act_period_id = ?
      `
      const activitiesResult = await db.query(activitiesQuery, [periodId])
      
      // Consulta para obtener los colectivos del periodo
      const collectivesQuery = `
        SELECT * FROM collectives 
        WHERE col_period_id = ?
      `
      const collectivesResult = await db.query(collectivesQuery, [periodId])
  
      // Devolver objeto con los resultados
      return {
        periodId,
        periodName,
        periodStartDate,
        periodEndDate,
        periodExclusive,
        periodStatus,
        periodCreateAdminId,
        activities: activitiesResult,
        collectives: collectivesResult
      }
    } catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL PERIODO PARA DESCARGA')
    }
  }  
}


module.exports = Period