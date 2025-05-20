const express = require("express")
const router = express.Router()

router.use("/users", require("./userRoutes"))
router.use("/periods", require("./periodRoutes"))
router.use("/contacts", require("./contactRoutes"))
router.use("/activities", require("./activityRoutes"))
router.use("/evidence", require("./evidenceRoutes"))

module.exports = router