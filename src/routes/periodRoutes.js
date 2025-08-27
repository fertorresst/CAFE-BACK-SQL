const express = require("express")
const router = express.Router()
const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')
const periodController = require("../controller/periodController")

router.get("/get-all-periods", adminAuthMiddleware, periodController.getAllPeriods)
router.get("/get-period-info/:id", adminAuthMiddleware, periodController.getPeriodInfo)
router.post("/create-period", adminAuthMiddleware, periodController.createPeriod)
router.delete("/delete-period/:id", adminAuthMiddleware, periodController.deletePeriod)
router.patch("/update-dates", adminAuthMiddleware, periodController.updateDates)
router.patch("/update-status", adminAuthMiddleware, periodController.updateStatus)
router.get("/get-all-period-activities/:id", adminAuthMiddleware, periodController.getAllPeriodActivities)
router.get("/get-area-counts/:id", adminAuthMiddleware, periodController.getAreaCountsByPeriodId)
router.get("/get-period-for-download/:id", adminAuthMiddleware, periodController.getPeriodForDownload)
router.get("/final-report/:periodId", adminAuthMiddleware, periodController.getFinalReport)
router.get('/download-report/:id', adminAuthMiddleware, periodController.downloadPeriodReport)
router.get('/download-career-report', adminAuthMiddleware, periodController.downloadCareerReport)

module.exports = router