-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cafe;
USE cafe;

-- =========================
-- TABLA DE ADMINISTRADORES
-- =========================
CREATE TABLE IF NOT EXISTS admins (
    adm_id INT NOT NULL AUTO_INCREMENT,
    adm_email VARCHAR(100) NOT NULL,
    adm_password VARCHAR(255) NOT NULL,
    adm_name VARCHAR(50) NOT NULL,
    adm_last_name VARCHAR(50) NOT NULL,
    adm_second_last_name VARCHAR(50),
    adm_phone VARCHAR(15) NOT NULL,
    adm_active BOOL NOT NULL DEFAULT 1,
    adm_role ENUM('superadmin', 'admin', 'validador', 'consulta') NOT NULL DEFAULT 'admin',
    adm_profile_picture VARCHAR(255),
    adm_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    adm_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adm_id),
    CONSTRAINT unique_adm_email UNIQUE (adm_email),
    INDEX idx_adm_email (adm_email)
);

/*
    superadmin: Acceso total al sistema, puede gestionar todos los administradores, periodos, usuarios y actividades.
    admin: Puede gestionar periodos, usuarios y actividades, pero no puede crear o eliminar administradores.
    validador: Puede validar actividades y gestionar contactos administrativos, pero no puede crear o eliminar periodos o administradores.
    consulta: Puede consultar actividades y periodos, pero no puede realizar modificaciones.
*/

-- =========================
-- TABLA DE PERIODOS
-- =========================
CREATE TABLE IF NOT EXISTS periods (
    per_id INT NOT NULL AUTO_INCREMENT,
    per_name VARCHAR(20) NOT NULL, -- Formato: EJAA-01 o ADAA-01, E al final si es exclusivo para egresados
    per_date_start DATE NOT NULL,
    per_date_end DATE NOT NULL,
    per_exclusive BOOL NOT NULL,
    per_status ENUM('active', 'pending', 'ended') NOT NULL,
    per_create_admin_id INT NOT NULL,
    per_report_path VARCHAR(255),
    per_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    per_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (per_id),
    CONSTRAINT fk_period_admin FOREIGN KEY (per_create_admin_id) 
        REFERENCES admins(adm_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT unique_per_name UNIQUE (per_name),
    CONSTRAINT chk_period_dates CHECK (per_date_start < per_date_end),
    INDEX idx_per_status (per_status)
);

-- =========================
-- TABLA DE USUARIOS
-- =========================
CREATE TABLE IF NOT EXISTS users (
    use_id INT NOT NULL AUTO_INCREMENT,
    use_nua INT NOT NULL,
    use_name VARCHAR(50) NOT NULL,
    use_last_name VARCHAR(50) NOT NULL,
    use_second_last_name VARCHAR(50),
    use_career ENUM(
        'IS75LI0103', -- LICENCIATURA EN INGENIERÍA MECÁNICA
        'IS75LI0203', -- LICENCIATURA EN INGENIERÍA ELÉCTRICA
        'IS75LI0303', -- LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA
        'IS75LI03Y3', -- LICENCIATURA EN INGENIERÍA EN COMUNICACIONES Y ELECTRÓNICA (Yuriria)
        'IS75LI0403', -- LICENCIATURA EN INGENIERÍA EN MECATRÓNICA
        'IS75LI0502', -- LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES
        'IS75LI05Y2', -- LICENCIATURA EN INGENIERÍA EN SISTEMAS COMPUTACIONALES (Yuriria)
        'IS75LI0602', -- LICENCIATURA EN GESTIÓN EMPRESARIAL
        'IS75LI06Y2', -- LICENCIATURA EN GESTIÓN EMPRESARIAL (Yuriria)
        'IS75LI0702', -- LICENCIATURA EN ARTES DIGITALES
        'IS75LI0801', -- LICENCIATURA EN INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL
        'IS75LI08Y2'  -- LICENCIATURA EN ENSEÑANZA DEL INGLÉS
    ) NOT NULL,
    use_phone VARCHAR(15) NOT NULL,
    use_email VARCHAR(100) NOT NULL,
    use_password VARCHAR(255) NOT NULL,
    use_sede ENUM('SALAMANCA', 'YURIRIA') NOT NULL,
    use_profile_picture VARCHAR(255),
    use_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    use_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (use_id),
    CONSTRAINT unique_use_nua UNIQUE (use_nua),
    CONSTRAINT unique_use_email UNIQUE (use_email),
    INDEX idx_use_nua (use_nua),
    INDEX idx_use_email (use_email)
);

-- =========================
-- TABLA DE ACTIVIDADES
-- =========================
CREATE TABLE IF NOT EXISTS activities (
    act_id INT NOT NULL AUTO_INCREMENT,
    act_name VARCHAR(100) NOT NULL,
    act_date_start DATE NOT NULL,
    act_date_end DATE NOT NULL,
    act_hours INT NOT NULL,
    act_institution VARCHAR(100) NOT NULL,
    act_evidence JSON NOT NULL,
    act_area ENUM('DP/VSS', 'RS/VCI', 'CEE/EIE', 'FCI/ICP', 'AC') NOT NULL,
    act_status ENUM('approval', 'pending', 'rejected', 'contacted') NOT NULL,
    act_observations TEXT,
    act_last_admin_id INT,
    act_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    act_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    act_user_id INT NOT NULL,
    act_period_id INT NOT NULL,
    PRIMARY KEY (act_id),
    CONSTRAINT fk_activity_user FOREIGN KEY (act_user_id) 
        REFERENCES users(use_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_activity_period FOREIGN KEY (act_period_id) 
        REFERENCES periods(per_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_activity_last_admin FOREIGN KEY (act_last_admin_id)
        REFERENCES admins(adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_activity_dates CHECK (act_date_start <= act_date_end),
    CONSTRAINT chk_activity_hours CHECK (act_hours > 0),
    INDEX idx_act_area (act_area),
    INDEX idx_activities_period (act_period_id),
    INDEX idx_act_user (act_user_id),
    INDEX idx_act_status (act_status)
);

-- =========================
-- TABLA DE CONTACTOS ADMINISTRATIVOS
-- =========================
CREATE TABLE IF NOT EXISTS contact (
    con_id INT NOT NULL AUTO_INCREMENT,
    con_user_id INT NOT NULL,
    con_admin_id INT NOT NULL,
    con_period_id INT NOT NULL,
    con_activity_id INT,
    con_description TEXT NOT NULL,
    con_observations TEXT,
    con_status ENUM('pending', 'in_progress', 'resolved', 'cancelled') NOT NULL DEFAULT 'pending',
    con_last_admin_id INT,
    con_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    con_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (con_id),
    CONSTRAINT fk_contact_user FOREIGN KEY (con_user_id) 
        REFERENCES users(use_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_contact_admin FOREIGN KEY (con_admin_id) 
        REFERENCES admins(adm_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_contact_period FOREIGN KEY (con_period_id) 
        REFERENCES periods(per_id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_contact_activity FOREIGN KEY (con_activity_id) 
        REFERENCES activities(act_id) 
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_contact_last_admin FOREIGN KEY (con_last_admin_id)
        REFERENCES admins(adm_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT unique_activity_contact UNIQUE (con_user_id, con_period_id, con_activity_id),
    INDEX idx_contact_user (con_user_id),
    INDEX idx_contact_admin (con_admin_id),
    INDEX idx_contact_period (con_period_id),
    INDEX idx_contact_status (con_status),
    INDEX idx_contact_last_admin (con_last_admin_id)
);

-- =========================
-- TABLA DE QR CODES POR CARRERA Y ÁREA
-- =========================
CREATE TABLE IF NOT EXISTS qr_codes (
    qr_id INT NOT NULL AUTO_INCREMENT,
    qr_career ENUM(
        'IS75LI0103',
        'IS75LI0203',
        'IS75LI0303',
        'IS75LI03Y3',
        'IS75LI0403',
        'IS75LI0502',
        'IS75LI05Y2',
        'IS75LI0602',
        'IS75LI06Y2',
        'IS75LI0702',
        'IS75LI0801',
        'IS75LI08Y2'
    ) NOT NULL,
    qr_area ENUM('DP/VSS', 'RS/VCI', 'CEE/EIE', 'FCI/ICP', 'AC') NOT NULL,
    qr_image_path VARCHAR(255) NOT NULL, -- Ruta del archivo de imagen QR
    qr_description VARCHAR(255), -- Descripción opcional
    qr_active BOOLEAN NOT NULL DEFAULT 1, -- Para desactivar sin eliminar
    qr_created_by INT NOT NULL,
    qr_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    qr_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (qr_id),
    CONSTRAINT fk_qr_admin FOREIGN KEY (qr_created_by) 
        REFERENCES admins(adm_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT unique_qr_career_area UNIQUE (qr_career, qr_area),
    INDEX idx_qr_career (qr_career),
    INDEX idx_qr_area (qr_area),
    INDEX idx_qr_active (qr_active)
);

-- =========================
-- TABLA EMAIL_VERIFICATIONS
-- =========================
-- Tabla para los códigos de verificación de correo (registro de estudiantes).
-- Ejecutar una sola vez en MySQL Workbench.
CREATE TABLE IF NOT EXISTS email_verifications (
    ev_id INT NOT NULL AUTO_INCREMENT,
    ev_email VARCHAR(100) NOT NULL,
    ev_code_hash VARCHAR(255) NOT NULL,      -- hash del código, nunca el código en claro
    ev_expires_at DATETIME NOT NULL,         -- el código vive 10 minutos
    ev_attempts INT NOT NULL DEFAULT 0,      -- máximo 5 intentos por código
    ev_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ev_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ev_id),
    -- Necesario: el modelo usa ON DUPLICATE KEY UPDATE para reemplazar el código anterior
    CONSTRAINT unique_ev_email UNIQUE (ev_email)
);

-- =========================
-- TABLA NOTIFICATIONS
-- =========================
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

-- =========================
-- TABLA PASSWORD_RESETS
-- =========================
-- Tabla para los códigos de recuperación de contraseña de los estudiantes.
-- Ejecutar una sola vez en MySQL Workbench.
CREATE TABLE IF NOT EXISTS password_resets (
    pr_id INT NOT NULL AUTO_INCREMENT,
    pr_email VARCHAR(100) NOT NULL,
    pr_code_hash VARCHAR(255) NOT NULL,      -- hash del código, nunca el código en claro
    pr_expires_at DATETIME NOT NULL,         -- el código vive 10 minutos
    pr_sent_at DATETIME NOT NULL,            -- cuándo se envió (para esperar 60 s entre códigos)
    pr_attempts INT NOT NULL DEFAULT 0,      -- máximo 5 intentos por código
    pr_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pr_id),
    -- Necesario: el modelo usa ON DUPLICATE KEY UPDATE para reemplazar el código anterior
    CONSTRAINT unique_pr_email UNIQUE (pr_email)
);

-- =========================
-- ADMINISTRADOR INICIAL
-- =========================
INSERT INTO admins (adm_email, adm_password, adm_name, adm_last_name, adm_second_last_name, adm_phone, adm_role, adm_profile_picture) VALUES
('superadmin@ugto.mx', '$2a$10$/MpxIaIcYrOr3K.4iBsOAuVOAUi82aXxlBA7OXIiugubbpj3SfBJa', 'Super', 'Admin', '', '4611000000', 'superadmin', '/profiles/superadmin.jpg');

