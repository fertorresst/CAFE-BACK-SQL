const db = require('../config/mysql')
const IPeriod = require('../interfaces/IPeriod')

class Period extends IPeriod {
	constructor(id, name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updateAdminId, updatedAt) {
		super()
		this.id = id
    this.name = name
    this.dateStart = dateStart
    this.dateEnd = dateEnd
    this.exclusive = exclusive
    this.status = status
    this.createAdminId = createAdminId
    this.createdAt = createdAt
    this.updateAdminId = updateAdminId
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

  static async createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updateAdminId, updatedAt) {
    try {
      if (new Date(dateStart) >= new Date(dateEnd)) {
        throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
      }

      // Convertir strings a objetos Date para comparaciones precisas
      const newStartDate = new Date(dateStart)
      const newEndDate = new Date(dateEnd)

      // Obtener todos los periodos existentes
      const query = 'SELECT * FROM periods'
      const existingPeriods = await db.query(query)
      
      // Verificar si hay superposición de fechas con algún periodo existente
      for (const period of existingPeriods) {
        const existingStartDate = new Date(period.per_date_start)
        const existingEndDate = new Date(period.per_date_end)
        
        // Verificar superposición:
        // Si la fecha de inicio del nuevo periodo está dentro del rango de un periodo existente
        // O si la fecha de fin del nuevo periodo está dentro del rango de un periodo existente
        // O si el nuevo periodo contiene completamente a un periodo existente
        if (
          (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
          (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
          (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
        ) {
          throw new Error(`EL PERIODO SE SOLAPA CON EL PERIODO EXISTENTE: ${period.per_name} (${period.per_date_start} - ${period.per_date_end})`)
        }
      }

      const allPeriods = await Period.getAllPeriods()
      const periodExists = allPeriods.find(period => period.name === name)
      if (periodExists) {
        throw new Error('EL PERIODO YA EXISTE')
      }

      const insertQuery = 'INSERT INTO periods (name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updateAdminId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      const result = await db.query(insertQuery, [name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updateAdminId, updatedAt])
      const id = result.insertId
      
      return new Period(id, name, dateStart, dateEnd, exclusive, status, createAdminId, createdAt, updateAdminId, updatedAt)
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL CREAR EL PERIODO')
    }
  }

  // static async deletePeriod(id) {
  //   try {
  //     const period = await firestore.collection('periods').doc(id).get()
  //     if (!period.exists) {
  //       throw new Error('EL PERIODO NO EXISTE')
  //     }

  //     await firestore.collection('periods').doc(id).delete()
  //     return new Period(period.data())
  //   } 
  //   catch (err) {
  //     console.log('ERROR =>', err)
  //     throw new Error(err.message || 'ERROR AL ELIMINAR EL PERIODO')
  //   }
  // }
  
  // static async updateDates(id, dateStart, dateEnd) {
  //   try {
  //     if (new Date(dateStart) >= new Date(dateEnd)) {
  //       throw new Error('LA FECHA DE INICIO DEBE SER MENOR A LA FECHA DE FIN')
  //     }

  //     const period = await firestore.collection('periods').doc(id).get()
  //     if (!period.exists) {
  //       throw new Error('EL PERIODO NO EXISTE')
  //     }

  //     await firestore.collection('periods').doc(id).update({
  //       dateStart,
  //       dateEnd
  //     })

  //     return new Period(period.data())
  //   }
  //   catch (err) {
  //     console.log('ERROR =>', err)
  //     throw new Error(err.message || 'ERROR AL ACTUALIZAR LAS FECHAS DEL PERIODO')
  //   }
  // }

  // static async updateStatus(id, status) {
  //   try {
  //     const period = await firestore.collection('periods').doc(id).get()
  //     if (!period.exists) {
  //       throw new Error('EL PERIODO NO EXISTE')
  //     }

  //     await firestore.collection('periods').doc(id).update({
  //       status
  //     })

  //     return new Period(period.data())
  //   }
  //   catch (err) {
  //     console.log('ERROR =>', err)
  //     throw new Error(err.message || 'ERROR AL ACTUALIZAR EL ESTADO DEL PERIODO')
  //   }
  // }

  // static async getAllPeriodActivities(id) {
  //   try {
  //     // Verificar que el periodo existe
  //     const period = await firestore.collection('periods').doc(id).get()
  //     if (!period.exists) {
  //       throw new Error('EL PERIODO NO EXISTE')
  //     }
  
  //     // Obtener todas las actividades de alumnos
  //     const alumsActivitiesSnapshot = await firestore
  //       .collection('periods')
  //       .doc(id)
  //       .collection('alumsActivities')
  //       .get()
  
  //     // Obtener todas las actividades de grupos
  //     const collectiveActivitiesSnapshot = await firestore
  //       .collection('periods')
  //       .doc(id)
  //       .collection('collectiveActivities')
  //       .get()
  
  //     const activities = {
  //       alumsActivities: [],
  //       collectiveActivities: []
  //     }
  
  //     // Procesar actividades de alumnos
  //     for (const alumDoc of alumsActivitiesSnapshot.docs) {
  //       const alumActivitiesSnapshot = await alumDoc
  //         .ref.collection('activities')
  //         .get()
  
  //       const alumActivities = alumActivitiesSnapshot.docs.map(doc => ({
  //         alumno: alumDoc.id,
  //         ...doc.data()
  //       }))
  
  //       activities.alumsActivities.push(...alumActivities)
  //     }
  
  //     // Procesar actividades de grupos
  //     for (const groupDoc of collectiveActivitiesSnapshot.docs) {
  //       const groupActivitiesSnapshot = await groupDoc
  //         .ref.collection('activities')
  //         .get()
  
  //       const groupActivities = groupActivitiesSnapshot.docs.map(doc => ({
  //         grupo: groupDoc.id,
  //         ...doc.data()
  //       }))
  
  //       activities.collectiveActivities.push(...groupActivities)
  //     }
  
  //     return activities
  //   }
  //   catch (err) {
  //     console.log('ERROR =>', err)
  //     throw new Error(err.message || 'ERROR AL OBTENER LAS ACTIVIDADES DEL PERIODO')
  //   }
  // }
}

module.exports = Period