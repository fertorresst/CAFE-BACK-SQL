const mysql = require('mysql');
const { promisify } = require('util');

// Promisify es un módulo para manejo de promesas (operaciones asíncronas)

// Configurar la conexión a la base de datos
const connection = mysql.createPool(
  {
    host: 'localhost',
    user: 'cafe',
    password: '123456',
    database: 'proyecto_cafe'
  }
)

connection.getConnection ((err, conn) => {
    if (err)
      console.log('ERROR AL CONECTAR DB => ', err)

    if (conn)
      console.log('DB CONECTADA')

    return
  }
)

connection.query = promisify(connection.query)

module.exports = connection