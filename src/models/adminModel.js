const db = require("../config/mysql")
const bcryptjs = require('bcryptjs')

class Admin {
  /**
   * Obtiene todos los administradores registrados en el sistema.
   * @returns {Promise<Array>} Lista de administradores.
   */
  static async getAllAdmins() {
    const query = `
      SELECT 
        adm_id,
        adm_email,
        adm_name,
        adm_last_name,
        adm_second_last_name,
        adm_phone,
        adm_active,
        adm_role,
        adm_created_at,
        adm_updated_at
      FROM admins
      ORDER BY adm_id
    `
    const admins = await db.query(query)
    return admins.map(admin => ({
      id: admin.adm_id,
      email: admin.adm_email,
      name: admin.adm_name,
      lastName: admin.adm_last_name,
      secondLastName: admin.adm_second_last_name,
      phone: admin.adm_phone,
      active: admin.adm_active,
      role: admin.adm_role,
      createdAt: admin.adm_created_at
        ? new Date(admin.adm_created_at).toLocaleString('es-MX').split(',')[0]
        : null,
      updatedAt: admin.adm_updated_at
        ? new Date(admin.adm_updated_at).toLocaleString('es-MX').split(',')[0]
        : null
    }))
  }

  /**
   * Crea un nuevo administrador.
   * Valida que el correo y el teléfono no estén registrados previamente.
   * @param {Object} data - Datos del administrador.
   * @returns {Promise<number>} ID del nuevo administrador.
   */
  static async createAdmin(data) {
    // Validar campos requeridos
    const requiredFields = ['email', 'password', 'name', 'lastName', 'phone', 'role']
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`EL CAMPO '${field}' ES OBLIGATORIO`)
    }

    // Validar unicidad de email y teléfono
    const uniqueQuery = `
      SELECT adm_id FROM admins WHERE adm_email = ? OR adm_phone = ?
    `
    const existing = await db.query(uniqueQuery, [data.email, data.phone])
    if (existing.length > 0) {
      throw new Error('EL CORREO O TELÉFONO YA ESTÁ REGISTRADO')
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/
    if (!emailRegex.test(data.email)) {
      throw new Error('EL CORREO ELECTRÓNICO NO ES VÁLIDO')
    }

    // Validar longitud del teléfono
    if (!/^\d{10,15}$/.test(data.phone)) {
      throw new Error('EL TELÉFONO DEBE TENER ENTRE 10 Y 15 DÍGITOS')
    }

    // Validar rol
    const validRoles = ['superadmin', 'admin', 'validador', 'consulta']
    if (!validRoles.includes(data.role.toLowerCase())) {
      throw new Error(`EL ROL DEBE SER UNO DE LOS SIGUIENTES: ${validRoles.join(', ')}`)
    }

    // Validar fortaleza de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(data.password)) {
      throw new Error('LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES, UNA MAYÚSCULA, UNA MINÚSCULA, UN NÚMERO Y UN CARÁCTER ESPECIAL')
    }

    // Encriptar la contraseña antes de guardar
    const hashedPassword = await bcryptjs.hash(data.password, 10)

    // Insertar nuevo admin
    const insertQuery = `
      INSERT INTO admins (
        adm_email, adm_password, adm_name, adm_last_name, adm_second_last_name, adm_phone, adm_role
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const result = await db.query(insertQuery, [
      data.email,
      hashedPassword,
      data.name,
      data.lastName,
      data.secondLastName || null,
      data.phone,
      data.role.toLowerCase()
    ])
    return result.insertId
  }

  /**
   * Actualiza los datos de un administrador.
   * Valida que el email y el teléfono no estén repetidos en otros registros.
   * @param {number} id - ID del administrador a actualizar.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<boolean>} true si la actualización fue exitosa.
   */
  static async updateAdmin(id, data) {
    if (!id) throw new Error('ID DEL ADMINISTRADOR ES REQUERIDO')
    const requiredFields = ['email', 'name', 'lastName', 'phone', 'role']
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`EL CAMPO '${field}' ES OBLIGATORIO`)
    }

    // Validar unicidad de email y teléfono (excluyendo el propio admin)
    const uniqueQuery = `
      SELECT adm_id FROM admins 
      WHERE (adm_email = ? OR adm_phone = ?) AND adm_id <> ?
    `
    const existing = await db.query(uniqueQuery, [data.email, data.phone, id])
    if (existing.length > 0) {
      throw new Error('EL CORREO O TELÉFONO YA ESTÁ REGISTRADO')
    }

    // Validar formato de email
    const emailRegex = /.+@ugto\.mx$/
    if (!emailRegex.test(data.email)) {
      throw new Error('EL CORREO ELECTRÓNICO NO ES VÁLIDO')
    }

    // Validar longitud del teléfono
    if (!/^\d{10,15}$/.test(data.phone)) {
      throw new Error('EL TELÉFONO DEBE TENER ENTRE 10 Y 15 DÍGITOS')
    }

    // Validar rol
    const validRoles = ['superadmin', 'admin', 'validador', 'consulta']
    if (!validRoles.includes(data.role.toLowerCase())) {
      throw new Error(`EL ROL DEBE SER UNO DE LOS SIGUIENTES: ${validRoles.join(', ')}`)
    }

    // Actualizar datos
    const updateQuery = `
      UPDATE admins SET
        adm_email = ?,
        adm_name = ?,
        adm_last_name = ?,
        adm_second_last_name = ?,
        adm_phone = ?,
        adm_role = ?
      WHERE adm_id = ?
    `
    const result = await db.query(updateQuery, [
      data.email,
      data.name,
      data.lastName,
      data.secondLastName || null,
      data.phone,
      data.role.toLowerCase(),
      id
    ])
    return result.affectedRows > 0
  }

  /**
   * Actualiza la contraseña de un administrador.
   * Valida existencia, fortaleza y que no sea igual a la anterior.
   * @param {number} id - ID del administrador.
   * @param {string} newPassword - Nueva contraseña.
   * @returns {Promise<boolean>} true si la actualización fue exitosa.
   */
  static async updatePassword(id, newPassword) {
    if (!id) throw new Error('ID DEL ADMINISTRADOR ES REQUERIDO')
    if (!newPassword) throw new Error('LA NUEVA CONTRASEÑA ES OBLIGATORIA')

    // Validar fortaleza de la contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      throw new Error('LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES, UNA MAYÚSCULA, UNA MINÚSCULA, UN NÚMERO Y UN CARÁCTER ESPECIAL')
    }

    // Obtener la contraseña actual
    const query = 'SELECT adm_password FROM admins WHERE adm_id = ?'
    const [admin] = await db.query(query, [id])
    if (!admin) throw new Error('NO SE ENCONTRÓ EL ADMINISTRADOR')

    // Verificar que la nueva contraseña no sea igual a la anterior
    const isSame = await bcryptjs.compare(newPassword, admin.adm_password)
    if (isSame) throw new Error('LA NUEVA CONTRASEÑA NO PUEDE SER IGUAL A LA ANTERIOR')

    // Encriptar la nueva contraseña
    const hashedPassword = await bcryptjs.hash(newPassword, 10)

    // Actualizar la contraseña
    const updateQuery = 'UPDATE admins SET adm_password = ? WHERE adm_id = ?'
    const result = await db.query(updateQuery, [hashedPassword, id])
    return result.affectedRows > 0
  }

  /**
   * Cambia el estado de activo/inactivo de un administrador.
   * @param {number} id - ID del administrador.
   * @param {boolean|number} active - Nuevo estado (1 = activo) o (0 = inactivo).
   * @returns {Promise<boolean>}
   */
  static async setAdminActive(id, active) {
    if (!id) throw new Error('ID DEL ADMINISTRADOR ES REQUERIDO')
    if (active !== 0 && active !== 1 && active !== false && active !== true) {
      throw new Error('EL ESTADO DEBE SER 1 (ACTIVO) O 0 (INACTIVO)')
    }
    const updateQuery = 'UPDATE admins SET adm_active = ? WHERE adm_id = ?'
    const result = await db.query(updateQuery, [active ? 1 : 0, id])
    if (result.affectedRows === 0) throw new Error('NO SE ENCONTRÓ EL ADMINISTRADOR')
    return true
  }

  /**
   * Elimina un administrador del sistema.
   * @param {number} id - ID del administrador.
   * @param {number} currentAdminId - ID del admin que realiza la acción.
   * @returns {Promise<boolean>}
   */
  static async deleteAdmin(id, currentAdminId) {
    if (!id) throw new Error('ID DEL ADMINISTRADOR ES REQUERIDO')
    if (id === 1) throw new Error('NO PUEDES ELIMINAR AL SUPERADMIN PRINCIPAL')
    if (id === currentAdminId) throw new Error('NO PUEDES ELIMINAR TU PROPIO PERFIL')

    const deleteQuery = 'DELETE FROM admins WHERE adm_id = ?'
    const result = await db.query(deleteQuery, [id])
    if (result.affectedRows === 0) throw new Error('NO SE ENCONTRÓ EL ADMINISTRADOR')
    return true
  }

  /**
   * Inicia sesión como administrador.
   * Valida credenciales y estado activo.
   * @param {string} email - Correo electrónico.
   * @param {string} password - Contraseña.
   * @returns {Promise<Object>} Datos del administrador.
   */
  static async login(email, password) {
    if (!email || !password) throw new Error('CORREO Y CONTRASEÑA REQUERIDOS')
    const query = 'SELECT * FROM admins WHERE adm_email = ? AND adm_active = 1'
    const [admin] = await db.query(query, [email])
    if (!admin) throw new Error('CREDENCIALES INVÁLIDAS')
    const valid = await bcryptjs.compare(password, admin.adm_password)
    if (!valid) throw new Error('CREDENCIALES INVÁLIDAS')
    // Retorna solo los datos necesarios
    return {
      id: admin.adm_id,
      email: admin.adm_email,
      name: [admin.adm_name, admin.adm_last_name, admin.adm_second_last_name].filter(Boolean).join(' '),
      role: admin.adm_role
    }
  }

  /**
   * Obtiene la información de un administrador por su ID.
   * @param {number} id - ID del administrador.
   * @returns {Promise<Object>} Datos del administrador.
   */
  static async getAdminById(id) {
    if (!id) throw new Error('ID DEL ADMINISTRADOR ES REQUERIDO')
    const query = `
      SELECT 
        adm_id,
        adm_email,
        adm_name,
        adm_last_name,
        adm_second_last_name,
        adm_phone,
        adm_active,
        adm_role,
        adm_created_at,
        adm_updated_at
      FROM admins
      WHERE adm_id = ?
    `
    const [admin] = await db.query(query, [id])
    if (!admin) throw new Error('NO SE ENCONTRÓ EL ADMINISTRADOR')
    return {
      id: admin.adm_id,
      email: admin.adm_email,
      name: admin.adm_name,
      lastName: admin.adm_last_name,
      secondLastName: admin.adm_second_last_name,
      phone: admin.adm_phone,
      active: admin.adm_active,
      role: admin.adm_role,
      createdAt: admin.adm_created_at
        ? new Date(admin.adm_created_at).toLocaleString('es-MX').split(',')[0]
        : null,
      updatedAt: admin.adm_updated_at
        ? new Date(admin.adm_updated_at).toLocaleString('es-MX').split(',')[0]
        : null
    }
  }
}

module.exports = Admin