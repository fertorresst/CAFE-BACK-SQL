const Activities = require('../models/activitiesModel')

/**
 * Obtiene todas las actividades de un periodo agrupadas por usuario.
 * @route GET /activities/period/:id
 */
const getActivitiesByPeriod = async (req, res) => {
  try {
    const { id } = req.params
    const data = await Activities.getActivitiesByPeriod(id)
    console.log("🚀 ~ getActivitiesByPeriod ~ data:", data[0].activities)
    res.status(200).json({
      data,
      success: true,
      message: data.length > 0
        ? 'ACTIVIDADES OBTENIDAS CORRECTAMENTE'
        : 'NO SE ENCONTRARON ACTIVIDADES PARA ESTE PERIODO'
    })
  }
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza el estado y observaciones de una actividad.
 * Requiere el ID del admin que realiza el cambio (lastAdminId).
 * @route PUT /activities/status/:activityId
 */
const updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params
    const { status, observations, lastAdminId } = req.body

    if (!lastAdminId) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL ADMINISTRADOR QUE REALIZA EL CAMBIO'
      })
    }

    await Activities.updateActivityStatus(activityId, status, observations, lastAdminId)

    res.status(200).json({
      success: true,
      message: 'ESTADO DE ACTIVIDAD ACTUALIZADO CORRECTAMENTE'
    })
  }
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza los datos de una actividad individual.
 * Requiere el ID del admin que realiza el cambio (lastAdminId).
 * @route PUT /activities/:activityId
 */
const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params
    const activityData = { ...req.body }

    if (!activityData.lastAdminId) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL ADMINISTRADOR QUE REALIZA EL CAMBIO'
      })
    }

    await Activities.updateActivity(activityId, activityData)

    res.status(200).json({
      success: true,
      message: 'ACTIVIDAD ACTUALIZADA CORRECTAMENTE'
    })
  }
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Obtiene todas las actividades de un usuario agrupadas por periodo.
 * @route GET /activities/user/:id
 */
const getActivitiesByUserId = async (req, res) => {
  try {
    const { id } = req.params
    const activities = await Activities.getActivitiesByUserId(id)
    res.status(200).json({
      activities,
      success: true,
      message: activities.periods && activities.periods.length > 0
        ? 'ACTIVIDADES DEL USUARIO OBTENIDAS CORRECTAMENTE'
        : 'NO SE ENCONTRARON ACTIVIDADES PARA ESTE USUARIO'
    })
  }
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Elimina una actividad por su ID (solo si el periodo está activo).
 * @route DELETE /activities/:activityId
 */
const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params
    await Activities.deleteActivity(activityId)
    res.status(200).json({
      success: true,
      message: 'ACTIVIDAD ELIMINADA CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

module.exports = {
  getActivitiesByPeriod,
  updateActivityStatus,
  updateActivity,
  getActivitiesByUserId,
  deleteActivity
}
