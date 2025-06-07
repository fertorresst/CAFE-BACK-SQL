const db = require("../config/mysql")
const ICollectives = require("../interfaces/ICollectives")

class Collectives extends ICollectives {
  constructor(id, event, institution, place, hours, date, authorization, description, signaturesFormat , evidence, area, status, observations, createdAt, updatedAt)
  {
    super()
    this.id = id
    this.event = event
    this.institution = institution
    this.place = place
    this.hours = hours
    this.date = date
    this.authorization = authorization
    this.description = description
    this.signaturesFormat = signaturesFormat
    this.evidence = evidence
    this.area = area
    this.status = status
    this.observations = observations
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static async getCollectivesByPeriod(periodId) {
    try {
      if (!periodId) {
        throw new Error('SE REQUIERE UN ID DE PERIODO VÁLIDO')
      }
  
      // Obtener todos los usuarios que han registrado colectivos en este periodo
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
        FROM
          users u
        INNER JOIN
          collectives c ON u.use_id = c.col_user_id
        WHERE
          c.col_period_id = ?
        ORDER BY
          u.use_last_name, u.use_name
      `
      
      const users = await db.query(usersQuery, [periodId])
      
      // Preparar arreglo para almacenar resultados
      const allCollectives = []
      
      // Para cada usuario, obtener sus colectivos del periodo
      for (const user of users) {
        // Construir nombre completo del usuario
        const fullName = `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim()
        
        // Consultar colectivos de este usuario en el periodo especificado
        const collectivesQuery = `
          SELECT
            c.col_id,
            c.col_event,
            c.col_institution,
            c.col_place,
            c.col_hours,
            c.col_date,
            c.col_authorization,
            c.col_signatures_format,
            c.col_evidence,
            c.col_area,
            c.col_status,
            c.col_observations,
            c.col_created_at,
            c.col_updated_at
          FROM
            collectives c
          WHERE
            c.col_user_id = ? AND
            c.col_period_id = ?
          ORDER BY
            c.col_date DESC
        `
        
        const userCollectives = await db.query(collectivesQuery, [user.use_id, periodId])
        
        // Formatear colectivos con sus participantes
        const formattedCollectives = []
        
        for (const collective of userCollectives) {
          // Obtener participantes del colectivo
          const participantsQuery = `
            SELECT
              u.use_id,
              u.use_nua,
              u.use_name,
              u.use_last_name,
              u.use_second_last_name,
              u.use_career
            FROM
              collective_participants cp
            INNER JOIN
              users u ON cp.cop_user_id = u.use_id
            WHERE
              cp.cop_collective_id = ?
            ORDER BY
              u.use_last_name, u.use_name
          `
          
          const participants = await db.query(participantsQuery, [collective.col_id])
          
          // Formatear la lista de participantes
          const formattedParticipants = participants.map(participant => {
            return {
              id: participant.use_id,
              nua: participant.use_nua,
              fullName: `${participant.use_name} ${participant.use_last_name} ${participant.use_second_last_name || ''}`.trim(),
              career: participant.use_career
            }
          })
          
          // Parsear el JSON de evidencias
          let evidenceLinks = []
          if (collective.col_evidence) {
            try {
              const evidence = JSON.parse(collective.col_evidence.toString())
              if (typeof evidence === 'object') {
                evidenceLinks = Object.values(evidence).flat().filter(item => item)
              }
            } catch (error) {
              console.error('Error al parsear JSON de evidencias:', error)
            }
          }
          
          // Formatear el colectivo con sus participantes
          formattedCollectives.push({
            id: collective.col_id,
            event: collective.col_event,
            institution: collective.col_institution,
            place: collective.col_place,
            hours: collective.col_hours,
            date: new Date(collective.col_date).toISOString().split('T')[0],
            authorization: collective.col_authorization,
            signaturesFormat: collective.col_signatures_format,
            area: collective.col_area,
            status: collective.col_status,
            observations: collective.col_observations,
            createdAt: new Date(collective.col_created_at).toLocaleString().split(',')[0],
            updatedAt: new Date(collective.col_updated_at).toLocaleString().split(',')[0],
            evidenceLinks,
            participants: formattedParticipants,
            participantsCount: formattedParticipants.length
          })
        }
        
        // Solo agregar usuarios que tengan colectivos
        if (formattedCollectives.length > 0) {
          allCollectives.push({
            id: user.use_id,
            nua: user.use_nua,
            fullName,
            career: user.use_career,
            email: user.use_email,
            phone: user.use_phone,
            collectives: formattedCollectives
          })
        }
      }
      
      return allCollectives
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS COLECTIVOS DEL PERIODO')
    }
  }
}

module.exports = Collectives