const { convertToWebp } = require('../utils/imageHelper')
const Activities = require('../models/activitiesModel')
const fs = require('fs')
const path = require('path')

/**
 * Crea una nueva actividad individual con evidencias (imágenes webp).
 * Recibe un FormData con imágenes y datos de la actividad.
 * @route POST /activities/with-evidence
 */
const createActivityWithEvidence = async (req, res) => {
  try {
    // Procesar imágenes
    const files = req.files || []
    const evidenceLinks = []
    for (const file of files) {
      const url = await convertToWebp(file.path, file.originalname)
      evidenceLinks.push(url)
    }

    // Procesar datos de la actividad (vienen en req.body)
    const {
      name, dateStart, dateEnd, hours, institution,
      area, status, observations, userId, periodId, lastAdminId
    } = req.body

    // Validar campos obligatorios
    if (!name || !dateStart || !dateEnd || !hours || !institution ||
        !area || !status || !userId || !periodId || !lastAdminId) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS PARA CREAR LA ACTIVIDAD'
      })
    }

    // Construir el objeto de evidencia
    const evidence = { fotos: evidenceLinks }

    // Guardar en la base de datos
    await Activities.createActivity({
      name,
      dateStart,
      dateEnd,
      hours,
      institution,
      evidence: JSON.stringify(evidence),
      area,
      status,
      observations,
      lastAdminId,
      userId,
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
 * Actualiza las evidencias de una actividad.
 * Permite agregar nuevas imágenes y eliminar las que ya no estén referenciadas.
 * @route PUT /activities/evidence/:activityId
 */
const updateActivityEvidence = async (req, res) => {
  try {
    const { activityId } = req.params
    // URLs de evidencias que el usuario quiere conservar (enviar como JSON.stringify([...]) desde el front)
    const keepEvidence = req.body.keepEvidence ? JSON.parse(req.body.keepEvidence) : []

    // Procesar nuevas imágenes (si las hay)
    const files = req.files || []
    const newEvidenceLinks = []
    for (const file of files) {
      const url = await convertToWebp(file.path, file.originalname)
      newEvidenceLinks.push(url)
    }

    // Obtener la actividad actual
    const [activity] = await Activities.getActivityRaw(activityId)
    if (!activity) {
      return res.status(404).json({ success: false, message: 'ACTIVIDAD NO ENCONTRADA' })
    }

    // Evidencias actuales
    let currentEvidence = []
    if (activity.act_evidence) {
      try {
        const parsed = JSON.parse(activity.act_evidence)
        currentEvidence = Object.values(parsed).flat().filter(Boolean)
      } catch (e) {}
    }

    // Determinar evidencias a eliminar (las que ya no están en keepEvidence)
    const toDelete = currentEvidence.filter(url => !keepEvidence.includes(url))

    // Eliminar archivos físicos
    for (const url of toDelete) {
      if (url.startsWith('/evidence/')) {
        const filePath = path.join(__dirname, '../../uploads', url)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }
    }

    // Nueva lista de evidencias (las que se mantienen + las nuevas)
    const updatedEvidence = { fotos: [...keepEvidence, ...newEvidenceLinks] }

    // Actualizar en la base de datos
    await Activities.updateActivityEvidence(activityId, updatedEvidence)

    res.json({
      success: true,
      message: 'ACTIVIDAD ACTUALIZADA CON ÉXITO',
      evidence: updatedEvidence.fotos
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Método auxiliar para obtener la actividad cruda (sin formatear)
Activities.getActivityRaw = async function(activityId) {
  const query = 'SELECT * FROM activities WHERE act_id = ?'
  return db.query(query, [activityId])
}

module.exports = { createActivityWithEvidence, updateActivityEvidence }
