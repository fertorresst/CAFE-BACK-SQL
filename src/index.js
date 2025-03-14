const express = require('express')
const cors = require('cors')
const routes = require('./routes/routes')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/', routes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`ESCUCHANDO EN EL PUERTO: ${PORT}`)
})