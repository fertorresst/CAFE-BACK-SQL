const express = require("express")
const router = express.Router()

const {
  createActivityWithEvidence,
  updateActivityEvidence
} = require('../controller/evidenceController')

const uploadEvidence = require('../middlewares/uploadEvidence')

const { authMiddleware } = require('../auth/authMiddleware')

router.post(
  "/create-activity-with-evidence",
  (req, res, next) => {
    console.time('multer-upload')
    next()
  },
  uploadEvidence.array('files', 2),
  (req, res, next) => {
    console.timeEnd('multer-upload')
    next()
  },
  createActivityWithEvidence
)

router.put(
  '/update-activity-evidence/:activityId',
  uploadEvidence.array('files', 2),
  updateActivityEvidence
)

module.exports = router