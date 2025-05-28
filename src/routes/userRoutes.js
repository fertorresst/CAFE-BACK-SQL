const express = require("express")
const router = express.Router()

const {
  registerUser,
  updateUser,
  loginUser,
  validatePassword
} = require("../controller/userController")

const { authMiddleware } = require('../auth/authMiddleware')

// router.post("/register", registerUser)
// router.post("/login", loginUser)
// router.put("/updateUser", authenticateToken, updateUser)
router.post("/validate-password", validatePassword)

module.exports = router