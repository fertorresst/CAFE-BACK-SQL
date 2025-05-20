const express = require("express")
const router = express.Router()
const {
  createActivityWithEvidence,
  updateActivityEvidence
} = require('../controller/evidenceController')
const uploadEvidence = require('../middlewares/uploadEvidence')

router.post(
  "/create-activity-with-evidence",
  uploadEvidence.array('files', 2),
  createActivityWithEvidence
)

router.put(
  '/update-activity-evidence/:activityId',
  uploadEvidence.array('files', 2),
  updateActivityEvidence
)

module.exports = router