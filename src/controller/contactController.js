const Contact = require('../models/contactModel')

/**
 * Obtiene todos los contactos administrativos de un periodo.
 * @route GET /contacts/period/:id
 */
const getContactsByPeriod = async (req, res) => {
  const { periodId } = req.params
  const { adminRole, adminId } = req // Se espera que el middleware agregue adminRole y adminId

  try {
    if (!periodId) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL PERIODO'
      })
    }
    if (adminRole === 'consulta') {
      return res.status(200).json({
        contacts: [],
        success: true,
        message: 'SIN CONTACTOS PARA CONSULTA'
      })
    }
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID DEL ADMINISTRADOR'
      })
    }
    const contacts = await Contact.getContactsByPeriod(periodId, adminRole, adminId)
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
  const { adminRole } = req
  try {
    // Solo superadmin y admin pueden eliminar contactos
    if (!['superadmin', 'admin'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA ELIMINAR CONTACTOS'
      })
    }
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
  const { id, observations, status, lastAdminId } = req.body
  const { adminRole } = req
  try {
    // Solo superadmin, admin y validador pueden modificar contactos
    if (!['superadmin', 'admin', 'validador'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA MODIFICAR CONTACTOS'
      })
    }
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'SE REQUIERE EL ID Y EL NUEVO ESTADO DEL CONTACTO'
      })
    }
    await Contact.updateContact(id, observations, status, lastAdminId)
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
  const { adminRole } = req
  try {
    // Solo superadmin, admin y validador pueden modificar contactos
    if (!['superadmin', 'admin', 'validador'].includes(adminRole)) {
      return res.status(403).json({
        success: false,
        message: 'NO TIENES PERMISOS PARA CREAR CONTACTOS'
      })
    }
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
