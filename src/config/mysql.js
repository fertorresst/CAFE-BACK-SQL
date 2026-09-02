const mysql = require('mysql2')
const { promisify } = require('util')
require('dotenv').config() // Carga las variables de entorno desde .env

/**
 * Configuración de la conexión a la base de datos MySQL usando variables de entorno.
 * Si alguna variable no está definida, se usan valores por defecto.
 */
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'proyecto_cafe'
})

/**
 * Verifica la conexión inicial a la base de datos.
 */
connection.getConnection((err, conn) => {
  if (err) {
    console.log('ERROR AL CONECTAR DB =>', err)
  }
  if (conn) {
    console.log('-> DB CONECTADA')
    console.log('------------------------------------------------\n')
    conn.release()
  }
})

/**
 * Permite usar promesas en las consultas con connection.query.
 */
connection.query = promisify(connection.query)

module.exports = connection
