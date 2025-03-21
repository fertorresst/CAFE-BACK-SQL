const express = require("express");
const router = express.Router();

const {
  registerUser,
  updateUser,
  loginUser,
  validatePassword
} = require("./../controller/userController")

const {
  getAllPeriods,
  getPeriodInfo,
  createPeriod,
  deletePeriod,
  updateDates,
  updateStatus,
  getAllPeriodActivities,
  getAreaCountsByPeriodId,
  getPeriodForDownload
} = require("../controller/periodController")

const {
  getContactsByPeriod,
  deleteContactById,
  updateContact
} = require("../controller/contactController")

// const authenticateToken = require("../auth/authMiddleware")

// router.post("/register", registerUser)
// router.post("/login", loginUser)
// router.post("/logout", (req, res) => { res.send("logout") })
// router.put("/updateUser", authenticateToken, updateUser)
router.post("/validate-password", validatePassword)

router.get("/get-all-periods", getAllPeriods)
router.get("/get-period-info/:id", getPeriodInfo)
router.post("/create-period", createPeriod)
router.delete("/delete-period/:id", deletePeriod)
router.patch("/update-dates", updateDates)
router.patch("/update-status", updateStatus)
router.get("/get-all-period-activities/:id", getAllPeriodActivities)
router.get("/get-area-counts/:id", getAreaCountsByPeriodId)
router.get("/get-period-for-download/:id", getPeriodForDownload)

router.get("/get-contacts-by-period/:id", getContactsByPeriod)
router.delete("/delete-contact-by-id/:id", deleteContactById)
router.patch("/update-contact", updateContact)

module.exports = router