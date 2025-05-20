/**
 * Archivo principal de arranque del backend.
 * Configura middlewares globales, rutas y servidor Express.
 */

const express = require("express")
const cors = require("cors")
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
app.use("/evidence", express.static(path.join(__dirname, "../uploads/evidence")))

/**
 * Habilita CORS para permitir peticiones desde otros orígenes (frontend)
 */
app.use(cors())

/**
 * Permite recibir y procesar JSON en las peticiones
 */
app.use(express.json())

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
  console.log(`Servidor escuchando en el puerto: ${PORT}`)
})