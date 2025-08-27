const { reportQueue } = require('../config/queue')
const ReportGenerator = require('./reportGenerator')

// Inicializar procesamiento de cola
reportQueue.process(async (job) => {
  try {
    const { periodId } = job.data
    console.log(`Iniciando generación de reporte para periodo ${periodId}...`)
    
    const reportPath = await ReportGenerator.generatePeriodReport(periodId)
    
    console.log(`Reporte generado exitosamente: ${reportPath}`)
    return { success: true, reportPath }
  } catch (error) {
    console.error(`Error en procesamiento de cola:`, error)
    throw error
  }
})

// Manejo de eventos
reportQueue.on('completed', (job) => {
  console.log(`Tarea completada: ${job.id}`)
})

reportQueue.on('failed', (job, err) => {
  console.error(`Tarea fallida ${job.id}: ${err.message}`)
})

console.log('\n------------------------------------------------')
console.log('-> PROCESADOR DE COLA INICIADO')

module.exports = {
  reportQueue
}
