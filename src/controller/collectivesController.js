const Collectives = require('../models/collectivesModel')

const getCollectivesByPeriod = async (req, res) => {
  try {
    const { id } = req.params
    const data = await Collectives.getCollectivesByPeriod(id)
    
    res.status(200).json({
      data,
      success: true,
      message: data.length > 0 
        ? 'ACTIVIDADES COLECTIVAS DEL PERIODO OBTENIDAS CORRECTAMENTE' 
        : 'NO SE ENCONTRARON ACTIVIDADES COLECTIVAS PARA ESTE PERIODO'
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
  getCollectivesByPeriod
}