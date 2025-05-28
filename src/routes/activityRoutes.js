const express = require("express")
const router = express.Router()

const {
  getActivitiesByPeriod,
  updateActivityStatus,
  updateActivity,
  getActivitiesByUserId,
  deleteActivity
} = require("../controller/activitiesController")

const { authMiddleware } = require('../auth/authMiddleware')

router.get("/get-activities-by-period/:id", getActivitiesByPeriod)
router.put("/update-activity/:activityId", updateActivity)
router.patch("/update-activity-status/:activityId", updateActivityStatus)
router.get("/get-activities-by-user/:id", getActivitiesByUserId)
router.delete("/delete-activity/:activityId", deleteActivity)

module.exports = router