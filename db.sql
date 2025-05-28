-- Crear base de datos
CREATE DATABASE IF NOT EXISTS proyecto_cafe;
USE proyecto_cafe;

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
    adm_role ENUM('superadmin', 'admin', 'validador', 'consulta') NOT NULL DEFAULT 'admin', -- Sistema de privilegios
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
    use_career ENUM('LIM', 'LIE', 'LICE', 'LIMT', 'LISC', 'LGE', 'LAD', 'LIDIA', 'LEI') NOT NULL,
    use_phone VARCHAR(15) NOT NULL,
    use_email VARCHAR(100) NOT NULL,
    use_password VARCHAR(255) NOT NULL,
    use_is_teacher BOOL NOT NULL,
    use_campus ENUM('Salamanca', 'Yuriria') NOT NULL, -- Nueva columna para sede
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
    act_area ENUM('DP', 'RS', 'CEE', 'FCI', 'AC') NOT NULL,
    act_status ENUM('approval', 'pending', 'rejected', 'contacted') NOT NULL,
    act_observations TEXT,
    act_last_admin_id INT, -- Nuevo campo: último admin que modificó la actividad
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
    CONSTRAINT unique_activity_contact UNIQUE (con_user_id, con_period_id, con_activity_id),
    INDEX idx_contact_user (con_user_id),
    INDEX idx_contact_admin (con_admin_id),
    INDEX idx_contact_period (con_period_id),
    INDEX idx_contact_status (con_status)
);

-- =========================
-- DATOS DE PRUEBA
-- =========================

-- Administradores
INSERT INTO admins (adm_email, adm_password, adm_name, adm_last_name, adm_second_last_name, adm_phone, adm_role) VALUES
('superadmin@unach.mx', '$2a$10$superadmin', 'Super', 'Admin', '', '4611000000', 'superadmin'),
('admin1@unach.mx', '$2a$10$admin1', 'Ana', 'Ramírez', 'Gómez', '4611000001', 'admin'),
('validador1@unach.mx', '$2a$10$validador1', 'Luis', 'Martínez', '', '4611000002', 'validador'),
('consulta1@unach.mx', '$2a$10$consulta1', 'Sofía', 'Hernández', '', '4611000003', 'consulta');

-- Periodos (EJ: Enero-Julio, AD: Agosto-Diciembre, AA: año, 01: consecutivo, E: egresados)
INSERT INTO periods (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) VALUES
('EJ24-01', '2024-01-15', '2024-07-01', 0, 'active', 1),
('AD24-01', '2024-08-01', '2024-12-15', 0, 'pending', 2),
('EJ24-02E', '2024-01-15', '2024-07-01', 1, 'pending', 1);

-- Usuarios
INSERT INTO users (use_nua, use_name, use_last_name, use_second_last_name, use_career, use_phone, use_email, use_password, use_is_teacher, use_campus) VALUES
(20240001, 'Carlos', 'López', 'Mendoza', 'LIM', '4612000001', 'carlos.lopez@unach.mx', '$2a$10$carlos', 0, 'Salamanca'),
(20240002, 'María', 'García', 'Sánchez', 'LIE', '4612000002', 'maria.garcia@unach.mx', '$2a$10$maria', 0, 'Yuriria'),
(20240003, 'José', 'Martínez', 'Pérez', 'LICE', '4612000003', 'jose.martinez@unach.mx', '$2a$10$jose', 0, 'Salamanca'),
(20240004, 'Laura', 'Hernández', 'Ruiz', 'LIMT', '4612000004', 'laura.hernandez@unach.mx', '$2a$10$laura', 0, 'Yuriria');

-- Actividades
INSERT INTO activities (act_name, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_observations, act_last_admin_id, act_user_id, act_period_id) VALUES
('Taller de Innovación', '2024-02-10', '2024-02-12', 12, 'UNACH', '{"fotos":["/evidence/innovacion1.webp"]}', 'DP', 'approval', 'Documentación completa', 2, 1, 1),
('Seminario de Liderazgo', '2024-03-05', '2024-03-07', 10, 'UNACH', '{"fotos":["/evidence/liderazgo1.webp"]}', 'CEE', 'pending', 'En revisión', 3, 2, 1),
('Foro de Educación', '2024-04-15', '2024-04-16', 8, 'UNACH', '{"fotos":["/evidence/educacion1.webp"]}', 'RS', 'rejected', 'Falta evidencia', 2, 3, 1),
('Curso de Tecnología', '2024-09-10', '2024-09-12', 15, 'UNACH', '{"fotos":["/evidence/tecnologia1.webp"]}', 'FCI', 'pending', '', 2, 1, 2);

-- Contactos administrativos
INSERT INTO contact (con_user_id, con_admin_id, con_period_id, con_activity_id, con_description, con_observations, con_status) VALUES
(1, 2, 1, 1, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 1, 2, 'Validación de actividad', 'En proceso', 'in_progress');
