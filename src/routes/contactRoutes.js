const express = require("express")
const router = express.Router()

const {
  getContactsByPeriod,
  deleteContactById,
  updateContact,
  createContact
} = require("../controller/contactController")

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

router.get("/get-contacts-by-period/:periodId", getContactsByPeriod)
router.delete("/delete-contact-by-id/:id", deleteContactById)
router.patch("/update-contact", updateContact)
router.post("/create-contact", createContact)

module.exports = router