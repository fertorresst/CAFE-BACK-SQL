const Contact = require('../models/contactModel')

/**
 * Obtiene todos los contactos administrativos de un periodo.
 * @route GET /contacts/period/:id
 */
const getContactsByPeriod = async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL PERIODO'
      })
    }
    const contacts = await Contact.getContactsByPeriod(id)
    res.status(200).json({
      contacts,
      success: true,
      message: 'CONTACTOS DEL PERIODO OBTENIDOS CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Elimina un contacto por su ID.
 * @route DELETE /contacts/:id
 */
const deleteContactById = async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL CONTACTO'
      })
    }
    await Contact.deleteContactById(id)
    res.status(200).json({
      success: true,
      message: 'CONTACTO ELIMINADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Actualiza las observaciones y el estado de un contacto.
 * @route PUT /contacts
 */
const updateContact = async (req, res) => {
  const { id, observations, status } = req.body
  try {
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID Y EL NUEVO ESTADO DEL CONTACTO'
      })
    }
    await Contact.updateContact(id, observations, status)
    res.status(200).json({
      success: true,
      message: 'CONTACTO ACTUALIZADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

/**
 * Crea un nuevo contacto administrativo.
 * @route POST /contacts
 */
const createContact = async (req, res) => {
  const { userId, adminId, periodId, activityId, description } = req.body
  try {
    if (!userId || !adminId || !periodId || !description) {
      return res.status(400).json({
        success: false,
        message: 'FALTAN CAMPOS OBLIGATORIOS'
      })
    }
    await Contact.createContact(userId, adminId, periodId, activityId, description)
    res.status(201).json({
      success: true,
      message: 'CONTACTO CREADO CORRECTAMENTE'
    })
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

module.exports = {
  getContactsByPeriod,
  deleteContactById,
  updateContact,
  createContact
}
