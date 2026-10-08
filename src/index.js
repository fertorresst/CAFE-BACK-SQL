/**
 * Archivo principal de arranque del backend.
 * Configura middlewares globales, rutas y servidor Express.
 */

const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const path = require("path")
const jwt = require('jsonwebtoken')
const routes = require("./routes") // Importa el index.js de la carpeta routes
require("dotenv").config()
require('./services/queueProcessor')

const app = express()

// ==============================
// MIDDLEWARES GLOBALES
// ==============================

// Cabeceras básicas de endurecimiento sin dependencias adicionales.
app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

// CORS limitado al frontend configurado.
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Límite simple de intentos de inicio de sesión por IP.
const loginAttempts = new Map()
app.use(['/api/admin/login', '/api/users/login'], (req, res, next) => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxAttempts = 10
  const key = req.ip
  const recent = (loginAttempts.get(key) || []).filter(ts => now - ts < windowMs)

  if (recent.length >= maxAttempts) {
    return res.status(429).json({ success: false, message: 'DEMASIADOS INTENTOS. INTENTA MÁS TARDE' })
  }

  recent.push(now)
  loginAttempts.set(key, recent)
  next()
})

// Protege evidencias y QR estáticos: se requiere una sesión válida de usuario o admin.
function staticAuth(req, res, next) {
  const token = req.cookies.admin_token || req.cookies.user_token
  if (!token) return res.status(401).json({ success: false, message: 'NO AUTORIZADO' })
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'TOKEN INVÁLIDO' })
  }
}

app.use('/evidence', staticAuth, express.static(path.join(__dirname, '../uploads/evidence')))
app.use('/qr-codes', staticAuth, express.static(path.join(__dirname, '../uploads/qr-codes')))

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
  console.log(`-> SERVIDOR ESCUCHANDO EL EN PUERTO: ${PORT}`)
})
