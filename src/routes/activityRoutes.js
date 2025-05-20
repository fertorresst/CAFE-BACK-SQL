const express = require("express")
const router = express.Router()
const {
  getActivitiesByPeriod,
  updateActivityStatus,
  updateActivity,
  getActivitiesByUserId,
  deleteActivity
} = require("../controller/activitiesController")

router.get("/get-activities-by-period/:id", getActivitiesByPeriod)
router.put("/update-activity/:activityId", updateActivity)
router.patch("/update-activity-status/:activityId", updateActivityStatus)
router.get("/get-activities-by-user/:id", getActivitiesByUserId)
router.delete("/delete-activity/:activityId", deleteActivity)

module.exports = router