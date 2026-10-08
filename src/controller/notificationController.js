const Notification = require('../models/notificationModel')

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const notifications = await Notification.getByUserId(userId)

    const unreadCount = notifications.filter(
      notification => !notification.isRead
    ).length

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'ERROR AL OBTENER LAS NOTIFICACIONES'
    })
  }
}

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const { notificationId } = req.params

    const result = await Notification.markAsRead(
      notificationId,
      userId
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'NOTIFICACIÓN NO ENCONTRADA'
      })
    }

    res.status(200).json({
      success: true,
      message: 'NOTIFICACIÓN MARCADA COMO LEÍDA'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'ERROR AL ACTUALIZAR LA NOTIFICACIÓN'
    })
  }
}

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await Notification.markAllAsRead(userId)

    res.status(200).json({
      success: true,
      message: 'NOTIFICACIONES MARCADAS COMO LEÍDAS'
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'ERROR AL ACTUALIZAR LAS NOTIFICACIONES'
    })
  }
}

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
}