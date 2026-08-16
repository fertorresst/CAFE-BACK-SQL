const express = require('express')
const router = express.Router()

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controller/notificationController')

const {
  userAuthMiddleware
} = require('../auth/userAuthMiddleware')

router.get(
  '/',
  userAuthMiddleware,
  getMyNotifications
)

router.patch(
  '/:notificationId/read',
  userAuthMiddleware,
  markNotificationAsRead
)

router.patch(
  '/read-all',
  userAuthMiddleware,
  markAllNotificationsAsRead
)

module.exports = router