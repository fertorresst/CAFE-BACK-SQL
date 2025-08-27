const Bull = require('bull')

// Crear las colas de trabajo
const reportQueue = new Bull('report-generation-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
})

module.exports = {
  reportQueue
}
