const { convertToWebp } = require('../utils/imageHelper')
const Activities = require('../models/activitiesModel')
const fs = require('fs')
const path = require('path')

/**
 * Crea una nueva actividad individual con evidencias (imágenes webp).
 * El ID del usuario y el estado se toman del contexto autenticado, no del cliente.
 */
const createActivityWithEvidence = async (req, res) => {
  try {
    const {
      name, dateStart, dateEnd, hours, institution,
      area, periodId
    } = req.body

    if (!name || !dateStart || !dateEnd || !hours || !institution || !area || !periodId) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS PARA CREAR LA ACTIVIDAD'
      })
    }

    const files = req.files || []
    const evidenceLinks = []
    for (const file of files) {
      const url = await convertToWebp(file.path, file.originalname)
      evidenceLinks.push(url)
      fs.unlink(file.path, () => {})
    }

    const evidence = { fotos: evidenceLinks }

    await Activities.createActivity({
      name,
      dateStart,
      dateEnd,
      hours,
      institution,
      evidence: JSON.stringify(evidence),
      area,
      status: 'pending',
      userId: req.user.id,
      periodId
    })

    res.status(201).json({
      success: true,
      message: 'ACTIVIDAD SUBIDA CON ÉXITO',
      evidenceLinks
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Actualiza una actividad y sus evidencias únicamente si pertenece al usuario autenticado
 * y el periodo continúa activo.
 */
const updateActivityEvidence = async (req, res) => {
  try {
    const { activityId } = req.params

    const [activity] = await Activities.getActivityRaw(activityId)
    if (!activity) {
      return res.status(404).json({ success: false, message: 'ACTIVIDAD NO ENCONTRADA' })
    }
    if (Number(activity.act_user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'NO PUEDES MODIFICAR ACTIVIDADES DE OTRO USUARIO' })
    }
    if (activity.per_status !== 'active') {
      return res.status(403).json({ success: false, message: 'NO SE PUEDE MODIFICAR UNA ACTIVIDAD DE UN PERIODO INACTIVO' })
    }

    const activityData = {
      name: req.body.name,
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
      hours: req.body.hours,
      institution: req.body.institution,
      area: req.body.area
    }

    let currentEvidence = []
    if (activity.act_evidence) {
      try {
        const parsed = JSON.parse(activity.act_evidence)
        currentEvidence = Object.values(parsed).flat().filter(Boolean)
      } catch (e) {}
    }

    let requestedKeepEvidence = []
    if (req.body.keepEvidence) {
      try {
        requestedKeepEvidence = JSON.parse(req.body.keepEvidence)
      } catch (e) {
        return res.status(400).json({ success: false, message: 'LISTA DE EVIDENCIAS INVÁLIDA' })
      }
    }
    const keepEvidence = requestedKeepEvidence.filter(url => currentEvidence.includes(url))

    const files = req.files || []
    const newEvidenceLinks = []
    for (const file of files) {
      const url = await convertToWebp(file.path, file.originalname)
      newEvidenceLinks.push(url)
      fs.unlink(file.path, () => {})
    }

    const toDelete = currentEvidence.filter(url => !keepEvidence.includes(url))
    for (const url of toDelete) {
      if (typeof url === 'string' && url.startsWith('/evidence/')) {
        const filePath = path.join(__dirname, '../../uploads', url)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }
    }

    const updatedEvidence = { fotos: [...keepEvidence, ...newEvidenceLinks] }
    await Activities.updateActivityEvidence(activityId, updatedEvidence)
    await Activities.updateActivity(activityId, activityData)

    res.json({
      success: true,
      message: 'ACTIVIDAD ACTUALIZADA CON ÉXITO',
      evidence: updatedEvidence.fotos
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { createActivityWithEvidence, updateActivityEvidence }
