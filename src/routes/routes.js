const express = require("express");
const router = express.Router();

// const {
//   registerUser,
//   updateUser,
//   loginUser,
//   validatePassword
// } = require("./../controller/userController")

const {
  getAllPeriods,
  createPeriod,
  deletePeriod,
  updateDates,
  updateStatus,
  getAreaCountsByPeriodId
  // getAllPeriodActivities
} = require("../controller/periodController")

// const authenticateToken = require("../auth/authMiddleware")

// router.post("/register", registerUser)
// router.post("/login", loginUser)
// router.post("/logout", (req, res) => { res.send("logout") })
// router.put("/updateUser", authenticateToken, updateUser)
// router.post("/validate-password", validatePassword)

router.get("/get-all-periods", getAllPeriods)
router.post("/create-period", createPeriod)
router.delete("/delete-period/:id", deletePeriod)
router.patch("/update-dates", updateDates)
router.patch("/update-status", updateStatus)
router.get("/get-area-counts/:id", getAreaCountsByPeriodId)

module.exports = router