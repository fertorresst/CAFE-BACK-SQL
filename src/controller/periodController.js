const Period = require('../models/periodModel')

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
  getFinalReport
}
