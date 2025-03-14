const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateToken = (req, res, next) => {
  
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      success: false
    })
  }
  const access = token.split(' ')

  if (!access[1]) {
    return res.status(401).json({
      message: 'Unauthorized',
      success: false
    })
  }

  jwt.verify(access[1], process.env.SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Forbidden',
        success: false
      })
    }
    req.user = user
    next()
  })
}

module.exports = authenticateToken