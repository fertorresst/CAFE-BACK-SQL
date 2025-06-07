const { convertToWebp } = require('../utils/imageHelper')
const Activities = require('../models/activitiesModel')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

/**
 * Crea una nueva actividad individual con evidencias (imágenes webp).
 * Recibe un FormData con imágenes y datos de la actividad.
 * @route POST /activities/with-evidence
 */
const createActivityWithEvidence = async (req, res) => {
  try {
    const files = req.files || []
    const evidenceLinks = []
    for (const file of files) {
      const url = await convertToWebp(file.path, file.originalname)
      evidenceLinks.push(url)
      // Elimina el archivo temporal con un pequeño delay
      setTimeout(() => {
        fs.unlink(file.path, err => {
          if (err) {
            console.error(`No se pudo eliminar el archivo temporal: ${file.path}`, err.message)
          }
        })
      }, 200)
    }

    // Procesar datos de la actividad (vienen en req.body)
    const {
      name, dateStart, dateEnd, hours, institution,
      area, status, userId, periodId
    } = req.body

    // Validar campos obligatorios
    if (!name || !dateStart || !dateEnd || !hours || !institution ||
        !area || !status || !userId || !periodId) {
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

    // Datos de la actividad (vienen en req.body)
    const activityData = {
      name: req.body.name,
      dateStart: req.body.dateStart,
      dateEnd: req.body.dateEnd,
      hours: req.body.hours,
      institution: req.body.institution,
      area: req.body.area,
    }

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
