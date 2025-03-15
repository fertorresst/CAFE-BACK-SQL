const jwt = require('jsonwebtoken')
const Period = require('../models/periodModel')

const getAllPeriods = async (req, res) => {
  console.log('GET ALL PERIODS')
  try {
    const periods = await Period.getAllPeriods()
    res.status(200).json({
      periods,
      success: true,
      message: 'PERIODOS OBTENIDOS CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const createPeriod = async (req, res) => {
  const { name, dateStart, dateEnd, exclusive, status, createAdminId } = req.body
  try {
    const period = await Period.createPeriod(name, dateStart, dateEnd, exclusive, status, createAdminId)
    res.status(201).json({
      period,
      success: true,
      message: 'PERIODO CREADO CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const deletePeriod = async (req, res) => {
  const { id } = req.params
  try {
    await Period.deletePeriod(id)
    res.status(201).json({
      success: true,
      message: 'PERIODO ELIMINADO CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const updateDates = async (req, res) => {
  const { id, dateStart, dateEnd } = req.body
  try {
    const period = await Period.updateDates(id, dateStart, dateEnd)
    res.status(201).json({
      period,
      success: true,
      message: 'FECHAS ACTUALIZADAS CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const updateStatus = async (req, res) => {
  const { id, status } = req.body
  try {
    const period = await Period.updateStatus(id, status)
    res.status(201).json({
      period,
      success: true,
      message: 'ESTADO ACTUALIZADO CORRECTAMENTE'
    })
  } 
  catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    })
  }
}

const getAreaCountsByPeriodId = async (req, res) => {
  const { id } = req.params
  try {
    const data = await Period.getAreaCountsByPeriodId(id)
    res.status(200).json({
      data,
      success: true,
      message: 'AREAS CONTADAS CORRECTAMENTE'
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
  getAllPeriods,
  createPeriod,
  deletePeriod,
  updateDates,
  updateStatus,
  getAreaCountsByPeriodId
  // getAllPeriodActivities
}
