const validatePassword = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'CONTRASEÑA OBTENIDA CORRECTAMENTE'
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
  validatePassword
}