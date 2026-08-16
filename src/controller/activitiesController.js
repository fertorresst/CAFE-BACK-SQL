const Activities = require('../models/activitiesModel')

/**
 * Obtiene todas las actividades de un periodo agrupadas por usuario.
 * @route GET /activities/period/:id
 */
const getActivitiesByPeriod = async (req, res) => {
  try {
    const { id } = req.params
    const data = await Activities.getActivitiesByPeriod(id)
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
    const { status, observations } = req.body

    // Solo superadmin, admin y validador pueden modificar
    if (!['superadmin', 'admin', 'validador'].includes(req.adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR ACTIVIDADES'
      })
    }

    await Activities.updateActivityStatus(activityId, status, observations, req.adminId)

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
    const activityData = { ...req.body, lastAdminId: req.adminId }

    // Solo superadmin, admin y validador pueden modificar
    if (!['superadmin', 'admin', 'validador'].includes(req.adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR ACTIVIDADES'
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
    if (Number(id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES CONSULTAR ACTIVIDADES DE OTRO USUARIO' })
    }
    const activities = await Activities.getActivitiesByUserId(req.user.id)
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
    const [activity] = await Activities.getActivityRaw(activityId)
    if (!activity) {
      return res.status(404).json({ success: false, message: 'ACTIVIDAD NO ENCONTRADA' })
    }
    if (Number(activity.act_user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES ELIMINAR ACTIVIDADES DE OTRO USUARIO' })
    }

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
