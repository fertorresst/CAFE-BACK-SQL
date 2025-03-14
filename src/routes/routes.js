const express = require("express");
const router = express.Router();

// const {
//   registerUser,
//   updateUser,
//   loginUser,
//   validatePassword
// } = require("./../controller/userController")

const {
  getAllPeriods
  // createPeriod,
  // deletePeriod,
  // updateDates,
  // updateStatus,
  // getAllPeriodActivities
} = require("../controller/periodController")

// const authenticateToken = require("../auth/authMiddleware")

// router.post("/register", registerUser)
// router.post("/login", loginUser)
// router.post("/logout", (req, res) => { res.send("logout") })
// router.put("/updateUser", authenticateToken, updateUser)
// router.post("/validate-password", validatePassword)

router.get("/get-all-periods", getAllPeriods)
// router.post("/create-period", createPeriod)
// router.delete("/delete-period/:id", deletePeriod)
// router.put("/update-dates", updateDates)
// router.put("/update-status", updateStatus)
// router.get("/get-all-period-activities/:id", getAllPeriodActivities)

module.exports = router