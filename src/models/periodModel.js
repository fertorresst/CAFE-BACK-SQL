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
      const query = 'SELECT * FROM periods'
      const periods = await db.query(query)
      return new Period(periods)
    }
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error('ERROR AL OBTENER LOS PERIODOS')
    }
  }

  static async createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId) {
    try {
      // Validar que las fechas sean válidas primero
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)

      // Verificar que las fechas son válidas
      if (isNaN(newStartDate) || isNaN(newEndDate)) {
        throw new Error('FECHAS INVÁLIDAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
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
        throw new Error('FECHAS INVÁLIDAS. ASEGÚRATE DE USAR EL FORMATO CORRECTO (YYYY-MM-DD)')
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
      if (existingPeriods && existingPeriods.length > 0) {
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
  
}


module.exports = Period