const db = require('../config/mysql')

class Notification {
  static async create({
    userId,
    activityId,
    adminId,
    title,
    message,
    status
  }) {
    const query = `
      INSERT INTO notifications (
        not_user_id,
        not_activity_id,
        not_admin_id,
        not_title,
        not_message,
        not_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await db.query(query, [
      userId,
      activityId,
      adminId || null,
      title,
      message,
      status || null
    ])

    return result
  }

  static async getByUserId(userId) {
    const query = `
      SELECT
        n.not_id AS id,
        n.not_title AS title,
        n.not_message AS message,
        n.not_status AS status,
        n.not_read AS isRead,
        n.not_created_at AS createdAt,
        n.not_read_at AS readAt,

        a.act_id AS activityId,
        a.act_name AS activityName,

        adm.adm_id AS adminId,
        adm.adm_name AS adminName

      FROM notifications n

      INNER JOIN activities a
        ON a.act_id = n.not_activity_id

      LEFT JOIN admins adm
        ON adm.adm_id = n.not_admin_id

      WHERE n.not_user_id = ?

      ORDER BY
        n.not_read ASC,
        n.not_created_at DESC
    `

    return db.query(query, [userId])
  }

  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications
      SET
        not_read = TRUE,
        not_read_at = CURRENT_TIMESTAMP
      WHERE not_id = ?
        AND not_user_id = ?
    `

    return db.query(query, [
      notificationId,
      userId
    ])
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET
        not_read = TRUE,
        not_read_at = CURRENT_TIMESTAMP
      WHERE not_user_id = ?
        AND not_read = FALSE
    `

    return db.query(query, [userId])
  }
}

module.exports = Notification