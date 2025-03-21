const Contact = require('../models/contactModel')

const getContactsByPeriod = async (req, res) => {
  const { id } = req.params
  try {
    const contacts = await Contact.getContactsByPeriod(id)
    res.status(200).json({
      contacts,
      success: true,
      message: 'CONTACTOS DEL PERIODO OBTENIDOS CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const deleteContactById = async (req, res) => {
  const { id } = req.params
  try {
    await Contact.deleteContactById(id)
    res.status(201).json({
      success: true,
      message: 'CONTACTO ELIMINADO CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const updateContact = async (req, res) => {
  const { id, observations, status } = req.body
  try {
    await Contact.updateContact(id, observations, status)
    res.status(201).json({
      success: true,
      message: 'CONTACTO ACTUALIZADO CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

module.exports = {
  getContactsByPeriod,
  deleteContactById,
  updateContact
}
