const db = require('../config/mysql')
const IUser = require('../interfaces/IUser')
const bcryptjs = require('bcryptjs')

class User extends IUser {
  constructor(id, nua, name, lastName, secondLastName, career, phone, email, password, sede, profilePicture, createdAt, updatedAt) {
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
    this.sede = sede
    this.profilePicture = profilePicture
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  /**
   * Obtiene todos los usuarios registrados en el sistema.
   * @returns {Promise<Array>} Lista de usuarios.
   */
  static async getAllUsers() {
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
        use_sede,
        use_profile_picture,
        use_created_at,
        use_updated_at
      FROM users
      ORDER BY use_last_name, use_name
    `
    const users = await db.query(query)
    return users.map(user => ({
      id: user.use_id,
      nua: user.use_nua,
      name: user.use_name,
      lastName: user.use_last_name,
      secondLastName: user.use_second_last_name,
      fullName: `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim(),
      career: user.use_career,
      phone: user.use_phone,
      email: user.use_email,
      sede: user.use_sede,
      profilePicture: user.use_profile_picture || null,
      createdAt: user.use_created_at
        ? new Date(user.use_created_at).toISOString().split('T')[0]
        : null,
      updatedAt: user.use_updated_at
        ? new Date(user.use_updated_at).toISOString().split('T')[0]
        : null
    }))
  }

  /**
   * Crea un nuevo usuario.
   * Valida que el NUA, correo y teléfono no estén registrados previamente.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<number>} ID del nuevo usuario.
   */
  static async createUser(data) {
    // Validar campos requeridos
    const requiredFields = ['nua', 'name', 'lastName', 'career', 'phone', 'email', 'password', 'sede']
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`EL CAMPO '${field}' ES OBLIGATORIO`)
    }

    // Validar unicidad de NUA, email y teléfono
    const uniqueQuery = `
      SELECT use_id FROM users WHERE use_nua = ? OR use_email = ?
    `
    const existing = await db.query(uniqueQuery, [data.nua, data.email])
    if (existing.length > 0) {
      throw new Error('EL NUA O CORREO YA ESTÁ REGISTRADO')
    }

    // Validar formato de NUA
    if (isNaN(data.nua) || data.nua.toString().length < 6) {
      throw new Error('EL NUA DEBE SER UN NÚMERO DE AL MENOS 6 DÍGITOS')
    }

    // Validar formato de email (dominio ugto.mx)
    const emailRegex = /.+@ugto\.mx$/
    if (!emailRegex.test(data.email)) {
      throw new Error('EL CORREO ELECTRÓNICO DEBE SER INSTITUCIONAL (@ugto.mx)')
    }

    // Validar longitud del teléfono
    if (data.phone.length < 10) {
      throw new Error('EL TELÉFONO DEBE TENER 10 DÍGITOS')
    }

    // Validar carrera
    const validCareers = [
      'IS75LI0103', // LICENCIATURA EN INGENIERÍA MECÁNICA
      'IS75LI0203', // LICENCIATURA EN INGENIERÍA ELÉCTRICA
      'IS75LI0303', // LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA
      'IS75LI03Y3', // LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA (Yuriria)
      'IS75LI0403', // LICENCIATURA EN INGENIERÍA EN MECATRÓNICA
      'IS75LI0502', // LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES
      'IS75LI05Y2', // LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES (Yuriria)
      'IS75LI0602', // LICENCIATURA EN GESTIÓN EMPRESARIAL
      'IS75LI06Y2', // LICENCIATURA EN GESTIÓN EMPRESARIAL (Yuriria)
      'IS75LI0702', // LICENCIATURA EN ARTES DIGITALES
      'IS75LI0801', // LICENCIATURA EN INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL
      'IS75LI08Y2'  // LICENCIATURA EN ENSEÑANZA DEL INGLÉS
    ]
    if (!validCareers.includes(data.career)) {
      throw new Error(`CARRERA NO VALIDA.`)
    }

    // Validar sede
    const validSedes = ['SALAMANCA', 'YURIRIA']
    if (!validSedes.includes(data.sede.toUpperCase())) {
      throw new Error('LA SEDE DEBE SER SALAMANCA O YURIRIA')
    }

    // Validar longitud y fortaleza de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(data.password)) {
      throw new Error('LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES, UNA MAYÚSCULA, UNA MINÚSCULA, UN NÚMERO Y UN CARÁCTER ESPECIAL')
    }

    // Encriptar la contraseña antes de guardar
    const hashedPassword = await bcryptjs.hash(data.password, 10)

    // Insertar nuevo usuario (agrega use_profile_picture si está presente)
    const insertQuery = `
      INSERT INTO users (
        use_nua, use_name, use_last_name, use_second_last_name, 
        use_career, use_phone, use_email, use_password, 
        use_sede, use_profile_picture
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const result = await db.query(insertQuery, [
      data.nua,
      data.name,
      data.lastName,
      data.secondLastName || null,
      data.career,
      data.phone,
      data.email,
      hashedPassword,
      data.sede.toUpperCase(),
      data.profilePicture || null
    ])
    return result.insertId
  }

  /**
   * Actualiza los datos de un usuario.
   * @param {number} id - ID del usuario a actualizar.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<boolean>} true si la actualización fue exitosa.
   */
  static async updateUser(id, data) {
    // Validar existencia de ID
    if (!id) throw new Error('ID DEL USUARIO ES REQUERIDO')

    // Validar campos requeridos
    const requiredFields = ['name', 'lastName', 'career', 'phone', 'email', 'sede']
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`EL CAMPO '${field}' ES OBLIGATORIO`)
    }

    // Validar unicidad de email (excluyendo el propio usuario)
    const uniqueQuery = `
      SELECT use_id FROM users 
      WHERE use_email = ? AND use_id <> ?
    `
    const existing = await db.query(uniqueQuery, [data.email, id])
    if (existing.length > 0) {
      throw new Error('EL CORREO ELECTRÓNICO YA ESTÁ REGISTRADO')
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/
    if (!emailRegex.test(data.email)) {
      throw new Error('EL CORREO ELECTRÓNICO DEBE SER INSTITUCIONAL (@ugto.mx)')
    }

    // Validar longitud del teléfono
    if (data.phone.length < 10) {
      throw new Error('EL TELÉFONO DEBE TENER 10 DÍGITOS')
    }

    // Validar carrera
    const validCareers = [
      'IS75LI0103', 'IS75LI0203', 'IS75LI0303', 'IS75LI03Y3', 'IS75LI0403',
      'IS75LI0502', 'IS75LI05Y2', 'IS75LI0602', 'IS75LI06Y2', 'IS75LI0702',
      'IS75LI0801', 'IS75LI08Y2'
    ]
    if (!validCareers.includes(data.career)) {
      throw new Error(`CARRERA NO VALIDA.`)
    }

    // Validar sede
    const validSedes = ['SALAMANCA', 'YURIRIA']
    if (!validSedes.includes(data.sede.toUpperCase())) {
      throw new Error('LA SEDE DEBE SER SALAMANCA O YURIRIA')
    }

    // Actualizar datos (incluye use_profile_picture)
    const updateQuery = `
      UPDATE users SET
        use_name = ?,
        use_last_name = ?,
        use_second_last_name = ?,
        use_career = ?,
        use_phone = ?,
        use_email = ?,
        use_sede = ?,
        use_profile_picture = ?
      WHERE use_id = ?
    `
    const result = await db.query(updateQuery, [
      data.name,
      data.lastName,
      data.secondLastName || null,
      data.career,
      data.phone,
      data.email,
      data.sede.toUpperCase(),
      data.profilePicture || null,
      id
    ])
    return result.affectedRows > 0
  }

  /**
   * Elimina un usuario del sistema.
   * @param {number} id - ID del usuario.
   * @returns {Promise<boolean>}
   */
  static async deleteUser(id) {
    if (!id) throw new Error('ID DEL USUARIO ES REQUERIDO')
    
    // Verificar si el usuario tiene actividades registradas
    const checkQuery = 'SELECT COUNT(*) as count FROM activities WHERE act_user_id = ?'
    const [result] = await db.query(checkQuery, [id])
    
    if (result.count > 0) {
      throw new Error('NO SE PUEDE ELIMINAR EL USUARIO PORQUE TIENE ACTIVIDADES REGISTRADAS')
    }
    
    const deleteQuery = 'DELETE FROM users WHERE use_id = ?'
    const deleteResult = await db.query(deleteQuery, [id])
    
    if (deleteResult.affectedRows === 0) throw new Error('NO SE ENCONTRÓ EL USUARIO')
    return true
  }

  /**
   * Inicia sesión como usuario.
   * @param {string} email - Correo electrónico.
   * @param {string} password - Contraseña.
   * @returns {Promise<Object>} Datos del usuario.
   */
  static async login(email, password) {
    if (!email || !password) throw new Error('CORREO Y CONTRASEÑA REQUERIDOS')
    
    const query = `
      SELECT 
        use_id, use_nua, use_name, use_last_name, 
        use_second_last_name, use_email, use_password,
        use_career, use_sede, use_profile_picture
      FROM users 
      WHERE use_email = ?
    `
    
    const [user] = await db.query(query, [email])
    if (!user) throw new Error('CREDENCIALES INVÁLIDAS')
    
    const valid = await bcryptjs.compare(password, user.use_password)
    if (!valid) throw new Error('CREDENCIALES INVÁLIDAS')
    
    // Retorna solo los datos necesarios
    return {
      id: user.use_id,
      nua: user.use_nua,
      name: user.use_name,
      lastName: user.use_last_name,
      secondLastName: user.use_second_last_name,
      fullName: `${user.use_name} ${user.use_last_name} ${user.use_second_last_name || ''}`.trim(),
      career: user.use_career,
      email: user.use_email,
      sede: user.use_sede,
      profilePicture: user.use_profile_picture || null
    }
  }

  /**
   * Obtiene la información de un usuario por su ID.
   * @param {number} id - ID del usuario.
   * @returns {Promise<Object>} Datos del usuario.
   */
  static async getUserById(id) {
    if (!id) throw new Error('ID DEL USUARIO ES REQUERIDO')
    const query = `
      SELECT 
        use_id, use_nua, use_name, use_last_name, use_second_last_name,
        use_career, use_phone, use_email, use_sede, use_profile_picture, use_created_at, use_updated_at
      FROM users
      WHERE use_id = ?
    `
    const [user] = await db.query(query, [id])
    if (!user) throw new Error('NO SE ENCONTRÓ EL USUARIO')
    return {
      id: user.use_id,
      nua: user.use_nua,
      name: user.use_name,
      lastName: user.use_last_name,
      secondLastName: user.use_second_last_name,
      career: user.use_career,
      phone: user.use_phone,
      email: user.use_email,
      sede: user.use_sede,
      profilePicture: user.use_profile_picture || null,
      createdAt: user.use_created_at
        ? new Date(user.use_created_at).toISOString().split('T')[0]
        : null,
      updatedAt: user.use_updated_at
        ? new Date(user.use_updated_at).toISOString().split('T')[0]
        : null
    }
  }
}

module.exports = User