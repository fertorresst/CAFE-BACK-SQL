const db = require('../config/mysql')
const IUser = require('../interfaces/IUser')

class User extends IUser {
  constructor(id, nua, name, lastName, secondLastName, career, phone, email, password, isTeacher, createdAt, updatedAt) {
    super()
    this.id = id
    this.nua = nua
    this.name = name
    this.lastName = lastName
    this.secondLastName = secondLastName
    this.career = career
    this.phone = phone
    this.email = email
    this.password = password
    this.isTeacher = isTeacher
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Obtiene todos los usuarios separados por rol (maestros y estudiantes)
   * @returns {Object} Objeto con dos arreglos: teachers y students
   */
  static async getUsersSeparatedByRole() {
    try {
      const query = `
        SELECT 
          use_id,
          use_nua,
          use_name,
          use_last_name,
          use_second_last_name,
          use_career,
          use_phone,
          use_email,
          use_is_teacher,
          use_created_at,
          use_updated_at
        FROM 
          users
        ORDER BY 
          use_last_name, 
          use_name
      `
      
      const users = await db.query(query)
      
      if (!users || users.length === 0) {
        return {
          teachers: [],
          students: []
        }
      }
      
      // Separar usuarios en maestros y estudiantes
      const teachers = []
      const students = []
      
      users.forEach(user => {
        // Formatear nombre completo
        const fullName = `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim()
        
        // Formatear fechas
        const createdAt = new Date(user.use_created_at).toISOString().split('T')[0]
        const updatedAt = new Date(user.use_updated_at).toISOString().split('T')[0]
        
        // Crear objeto de usuario formateado
        const formattedUser = {
          id: user.use_id,
          nua: user.use_nua,
          name: user.use_name,
          lastName: user.use_last_name,
          secondLastName: user.use_second_last_name,
          fullName: fullName,
          career: user.use_career,
          phone: user.use_phone,
          email: user.use_email,
          isTeacher: !!user.use_is_teacher, // Asegurarse de que sea booleano
          createdAt: createdAt,
          updatedAt: updatedAt
        }
        
        // Agregar al arreglo correspondiente
        if (user.use_is_teacher) {
          teachers.push(formattedUser)
        } else {
          students.push(formattedUser)
        }
      })
      
      return {
        teachers,
        students
      }
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER LOS USUARIOS')
    }
  }

  /**
   * Obtiene un usuario por su ID
   * @param {number} userId - ID del usuario
   * @returns {Object} Datos del usuario
   */
  static async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('SE REQUIERE UN ID DE USUARIO VÁLIDO')
      }
      
      const query = `
        SELECT 
          use_id,
          use_nua,
          use_name,
          use_last_name,
          use_second_last_name,
          use_career,
          use_phone,
          use_email,
          use_is_teacher,
          use_created_at,
          use_updated_at
        FROM 
          users
        WHERE 
          use_id = ?
      `
      
      const [user] = await db.query(query, [userId])
      
      if (!user) {
        throw new Error(`NO SE ENCONTRÓ EL USUARIO CON ID: ${userId}`)
      }
      
      // Formatear nombre completo y fechas
      const fullName = `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim()
      const createdAt = new Date(user.use_created_at).toISOString().split('T')[0]
      const updatedAt = new Date(user.use_updated_at).toISOString().split('T')[0]
      
      return {
        id: user.use_id,
        nua: user.use_nua,
        name: user.use_name,
        lastName: user.use_last_name,
        secondLastName: user.use_second_last_name,
        fullName: fullName,
        career: user.use_career,
        phone: user.use_phone,
        email: user.use_email,
        isTeacher: !!user.use_is_teacher,
        createdAt: createdAt,
        updatedAt: updatedAt
      }
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL OBTENER EL USUARIO')
    }
  }

  /**
   * Busca usuarios por nombre, apellido, NUA o correo electrónico
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Object} Objeto con dos arreglos: teachers y students que coinciden con la búsqueda
   */
  static async searchUsers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getUsersSeparatedByRole()
      }
      
      const query = `
        SELECT 
          use_id,
          use_nua,
          use_name,
          use_last_name,
          use_second_last_name,
          use_career,
          use_phone,
          use_email,
          use_is_teacher,
          use_created_at,
          use_updated_at
        FROM 
          users
        WHERE 
          use_name LIKE ? OR
          use_last_name LIKE ? OR
          use_second_last_name LIKE ? OR
          use_nua LIKE ? OR
          use_email LIKE ?
        ORDER BY 
          use_last_name, 
          use_name
      `
      
      const searchPattern = `%${searchTerm}%`
      const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
      
      const users = await db.query(query, params)
      
      if (!users || users.length === 0) {
        return {
          teachers: [],
          students: []
        }
      }
      
      // Separar usuarios en maestros y estudiantes
      const teachers = []
      const students = []
      
      users.forEach(user => {
        // Formatear nombre completo
        const fullName = `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim()
        
        // Formatear fechas
        const createdAt = new Date(user.use_created_at).toISOString().split('T')[0]
        const updatedAt = new Date(user.use_updated_at).toISOString().split('T')[0]
        
        // Crear objeto de usuario formateado
        const formattedUser = {
          id: user.use_id,
          nua: user.use_nua,
          name: user.use_name,
          lastName: user.use_last_name,
          secondLastName: user.use_second_last_name,
          fullName: fullName,
          career: user.use_career,
          phone: user.use_phone,
          email: user.use_email,
          isTeacher: !!user.use_is_teacher,
          createdAt: createdAt,
          updatedAt: updatedAt
        }
        
        // Agregar al arreglo correspondiente
        if (user.use_is_teacher) {
          teachers.push(formattedUser)
        } else {
          students.push(formattedUser)
        }
      })
      
      return {
        teachers,
        students
      }
    } 
    catch (err) {
      console.log('ERROR =>', err)
      throw new Error(err.message || 'ERROR AL BUSCAR USUARIOS')
    }
  }
}

module.exports = User