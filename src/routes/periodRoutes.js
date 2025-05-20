const express = require("express")
const router = express.Router()
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

router.get("/get-all-periods", getAllPeriods)
router.get("/get-period-info/:id", getPeriodInfo)
router.post("/create-period", createPeriod)
router.delete("/delete-period/:id", deletePeriod)
router.patch("/update-dates", updateDates)
router.patch("/update-status", updateStatus)
router.get("/get-all-period-activities/:id", getAllPeriodActivities)
router.get("/get-area-counts/:id", getAreaCountsByPeriodId)
router.get("/get-period-for-download/:id", getPeriodForDownload)

module.exports = router