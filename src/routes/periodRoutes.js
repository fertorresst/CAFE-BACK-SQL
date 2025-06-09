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
  getPeriodForDownload,
  getFinalReport
} = require("../controller/periodController")

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

router.get("/get-all-periods", adminAuthMiddleware, getAllPeriods)
router.get("/get-period-info/:id", adminAuthMiddleware, getPeriodInfo)
router.post("/create-period", adminAuthMiddleware, createPeriod)
router.delete("/delete-period/:id", adminAuthMiddleware, deletePeriod)
router.patch("/update-dates", adminAuthMiddleware, updateDates)
router.patch("/update-status", adminAuthMiddleware, updateStatus)
router.get("/get-all-period-activities/:id", adminAuthMiddleware, getAllPeriodActivities)
router.get("/get-area-counts/:id", adminAuthMiddleware, getAreaCountsByPeriodId)
router.get("/get-period-for-download/:id", adminAuthMiddleware, getPeriodForDownload)
router.get("/final-report/:periodId", adminAuthMiddleware, getFinalReport)

module.exports = router