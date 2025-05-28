/**
 * Archivo principal de arranque del backend.
 * Configura middlewares globales, rutas y servidor Express.
 */

const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const path = require("path")
const routes = require("./routes") // Importa el index.js de la carpeta routes
require("dotenv").config()

const app = express()

// ==============================
// MIDDLEWARES GLOBALES
// ==============================

/**
 * Sirve archivos estáticos de evidencias (imágenes) desde /uploads/evidence
 * Accesibles vía: http://localhost:PUERTO/evidence/archivo.webp
 */
app.use("/evidence", express.static(path.join(__dirname, '../uploads/evidence')))

/**
 * Habilita CORS para permitir peticiones desde otros orígenes (frontend)
 */
app.use(cors({
  origin: 'http://localhost:3000', // tu frontend
  credentials: true
}))

/**
 * Permite recibir y procesar JSON en las peticiones
 */
app.use(express.json())

/**
 * Permite el parseo de cookies en las peticiones
 */
app.use(cookieParser())

// ==============================
// RUTAS PRINCIPALES
// ==============================

/**
 * Todas las rutas de la API estarán bajo el prefijo /api
 * Ejemplo: http://localhost:PUERTO/api/periods/...
 */
app.use("/api", routes)

// ==============================
// INICIO DEL SERVIDOR
// ==============================

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`SERVIDOR ESCUCHANDO EL EN PUERTO: ${PORT}`)
})