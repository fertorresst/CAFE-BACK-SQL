USE cafe;

CREATE TABLE IF NOT EXISTS notifications (
    not_id INT NOT NULL AUTO_INCREMENT,
    not_user_id INT NOT NULL,
    not_activity_id INT NOT NULL,
    not_admin_id INT NULL,
    not_title VARCHAR(255) NOT NULL,
    not_message TEXT NOT NULL,
    not_status VARCHAR(50) NULL,
    not_read BOOLEAN NOT NULL DEFAULT FALSE,
    not_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    not_read_at TIMESTAMP NULL DEFAULT NULL,

    PRIMARY KEY (not_id),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (not_user_id)
        REFERENCES users(use_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notification_activity
        FOREIGN KEY (not_activity_id)
        REFERENCES activities(act_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_notification_admin
        FOREIGN KEY (not_admin_id)
        REFERENCES admins(adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_notification_user (not_user_id),
    INDEX idx_notification_activity (not_activity_id),
    INDEX idx_notification_read (not_read)
);
