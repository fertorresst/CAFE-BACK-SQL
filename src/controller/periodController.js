const Period = require('../models/periodModel')
const path = require('path')
const fs = require('fs')
const ReportGenerator = require('../services/reportGenerator')

/**
 * Obtiene todos los periodos con estadísticas de actividades.
 * @route GET /periods
 */
const getAllPeriods = async (req, res) => {
  try {
    // Todos los roles pueden consultar periodos
    const periods = await Period.getAllPeriods()
    res.status(200).json({
      periods,
      success: true,
      message: 'PERIODOS OBTENIDOS CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene la información detallada de un periodo.
 * @route GET /periods/:id
 */
const getPeriodInfo = async (req, res) => {
  const { id } = req.params
  try {
    // Todos los roles pueden consultar periodos
    const period = await Period.getPeriodInfo(id)
    res.status(200).json({
      period,
      success: true,
      message: 'PERIODO OBTENIDO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Crea un nuevo periodo.
 * @route POST /periods
 */
const createPeriod = async (req, res) => {
  const { name, dateStart, dateEnd, exclusive, status, createAdminId } = req.body
  const { adminRole } = req
  try {
    // Solo superadmin y admin pueden crear periodos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA CREAR PERIODOS'
      })
    }
    if (!name || !dateStart || !dateEnd || exclusive === undefined || !status || !createAdminId) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS PARA CREAR EL PERIODO'
      })
    }
    const period = await Period.createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId)
    res.status(201).json({
      period,
      success: true,
      message: 'PERIODO CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Elimina un periodo por su ID.
 * @route DELETE /periods/:id
 */
const deletePeriod = async (req, res) => {
  const { id } = req.params
  const { adminRole } = req
  try {
    // Solo superadmin y admin pueden eliminar periodos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA ELIMINAR PERIODOS'
      })
    }
    await Period.deletePeriod(id)
    res.status(200).json({
      success: true,
      message: 'PERIODO ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza las fechas de inicio y fin de un periodo.
 * @route PUT /periods/dates
 */
const updateDates = async (req, res) => {
  const { id, dateStart, dateEnd } = req.body
  const { adminRole } = req
  try {
    // Solo superadmin y admin pueden actualizar periodos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR PERIODOS'
      })
    }
    if (!id || !dateStart || !dateEnd) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS PARA ACTUALIZAR LAS FECHAS'
      })
    }
    const period = await Period.updateDates(id, dateStart, dateEnd)
    res.status(200).json({
      period,
      success: true,
      message: 'FECHAS ACTUALIZADAS CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza el estado de un periodo.
 * @route PUT /periods/status
 */
const updateStatus = async (req, res) => {
  const { id, status } = req.body
  const { adminRole } = req
  try {
    // Solo superadmin y admin pueden actualizar periodos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR PERIODOS'
      })
    }
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS PARA ACTUALIZAR EL ESTADO'
      })
    }
    const period = await Period.updateStatus(id, status)
    res.status(200).json({
      period,
      success: true,
      message: 'ESTADO ACTUALIZADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene todas las actividades de un periodo.
 * @route GET /periods/:id/activities
 */
const getAllPeriodActivities = async (req, res) => {
  const { id } = req.params
  try {
    // Solo superadmin y admin pueden descargar reportes de periodos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA DESCARGAR REPORTES DE PERIODOS'
      })
    }
    const data = await Period.getAllPeriodActivities(id)
    res.status(200).json({
      data,
      success: true,
      message: 'ACTIVIDADES OBTENIDAS CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene el conteo de actividades por área para un periodo.
 * @route GET /periods/:id/area-counts
 */
const getAreaCountsByPeriodId = async (req, res) => {
  const { id } = req.params
  try {
    // Todos los roles pueden consultar
    const data = await Period.getAreaCountsByPeriodId(id)
    res.status(200).json({
      data,
      success: true,
      message: 'AREAS CONTADAS CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene la información completa de un periodo para descarga.
 * @route GET /periods/:id/download
 */
const getPeriodForDownload = async (req, res) => {
  const { id } = req.params
  try {
    // Todos los roles pueden consultar
    const period = await Period.getPeriodForDownload(id)
    res.status(200).json({
      period,
      success: true,
      message: 'PERIODO OBTENIDO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene el reporte final de un periodo.
 * @route GET /periods/final-report/:periodId
 */
const getFinalReport = async (req, res) => {
  try {
    // Todos los roles pueden consultar
    const { periodId } = req.params
    const report = await Period.getFinalReport(Number(periodId))
    res.status(200).json(report)
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Descarga el reporte PDF de un periodo finalizado
 * @route GET /periods/download-report/:id
 */
const downloadPeriodReport = async (req, res) => {
  try {
    const { id } = req.params
    const reportPath = await Period.getReportPath(id)
    
    if (!reportPath) {
      // Verificar si el periodo está finalizado
      const period = await Period.getPeriodInfo(id)
      if (period.status !== 'ended') {
        return res.status(400).json({
          success: false,
          message: 'EL REPORTE SOLO ESTÁ DISPONIBLE PARA PERIODOS FINALIZADOS'
        })
      }
      
      // Si el periodo está finalizado pero no tiene reporte, iniciar generación
      setTimeout(async () => {
        try {
          await ReportGenerator.generatePeriodReport(id)
        } catch (err) {
          console.error(`Error generando reporte para periodo ${id}:`, err)
        }
      }, 100)
      
      return res.status(202).json({
        success: true,
        message: 'REPORTE EN GENERACIÓN, INTENTE MÁS TARDE',
        generating: true
      })
    }
    
    // Enviar archivo para descarga
    const filePath = path.join(__dirname, '../../uploads', reportPath)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'ARCHIVO DE REPORTE NO ENCONTRADO'
      })
    }
    
    res.download(filePath)
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Descarga el reporte PDF de todas las actividades de los usuarios de una carrera y sede en un periodo.
 * @route GET /periods/download-career-report?periodId=3&career=IS75LI0203&sede=YURIRIA
 */
const downloadCareerReport = async (req, res) => {
  try {
    const { periodId, career, sede } = req.query
    if (!periodId || !career || !sede) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros: periodId, career y sede son obligatorios'
      })
    }
    const pdfBuffer = await ReportGenerator.generateCareerReport(periodId, career, sede)
    console.log('Tamaño del PDF generado:', pdfBuffer.length)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="reporte-${career}-${sede}-periodo${periodId}.pdf"`)
    res.end(pdfBuffer) // <-- Usa end, no send
  } catch (err) {
    console.error('Error en downloadCareerReport:', err)
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack
    })
  }
}

module.exports = {
  getAllPeriods,
  getPeriodInfo,
  createPeriod,
  deletePeriod,
  updateDates,
  updateStatus,
  getAllPeriodActivities,
  getAreaCountsByPeriodId,
  getPeriodForDownload,
  getFinalReport,
  downloadPeriodReport,
  downloadCareerReport
}
