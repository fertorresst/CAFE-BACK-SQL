const express = require("express")
const router = express.Router()

const {
  getActivitiesByPeriod,
  updateActivityStatus,
  updateActivity,
  getActivitiesByUserId,
  deleteActivity
} = require("../controller/activitiesController")

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')
const { userAuthMiddleware } = require('../auth/userAuthMiddleware')

router.get("/get-activities-by-period/:id", adminAuthMiddleware, getActivitiesByPeriod)
router.put("/update-activity/:activityId", adminAuthMiddleware, updateActivity)
router.patch("/update-activity-status/:activityId", adminAuthMiddleware, updateActivityStatus)
router.get("/get-activities-by-user/:id", userAuthMiddleware, getActivitiesByUserId)
router.delete("/delete-activity/:activityId", userAuthMiddleware, deleteActivity)

module.exports = router