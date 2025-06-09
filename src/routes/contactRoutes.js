const express = require("express")
const router = express.Router()

const {
  getContactsByPeriod,
  deleteContactById,
  updateContact,
  createContact
} = require("../controller/contactController")

const { adminAuthMiddleware } = require('../auth/adminAuthMiddleware')

router.get("/get-contacts-by-period/:periodId", adminAuthMiddleware, getContactsByPeriod)
router.delete("/delete-contact-by-id/:id", adminAuthMiddleware, deleteContactById)
router.patch("/update-contact", adminAuthMiddleware, updateContact)
router.post("/create-contact", adminAuthMiddleware, createContact)

module.exports = router