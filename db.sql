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
        'IS75LI0801'  -- LICENCIATURA EN INGENIERÍA DE DATOS E INTELIGENCIA ARTIFICIAL li08y2
    ) NOT NULL,
    use_phone VARCHAR(15) NOT NULL,
    use_email VARCHAR(100) NOT NULL,
    use_password VARCHAR(255) NOT NULL,
    use_sede ENUM('SALAMANCA', 'YURIRIA') NOT NULL,
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
-- ADMINISTRADORES DE PRUEBA
-- =========================
INSERT INTO admins (adm_email, adm_password, adm_name, adm_last_name, adm_second_last_name, adm_phone, adm_role) VALUES
('superadmin@ugto.mx', '$2a$10$superadmin', 'Super', 'Admin', '', '4611000000', 'superadmin'),
('admin1@ugto.mx', '$2a$10$admin1', 'Ana', 'Ramírez', 'Gómez', '4611000001', 'admin'),
('validador1@ugto.mx', '$2a$10$validador1', 'Luis', 'Martínez', '', '4611000002', 'validador'),
('consulta1@ugto.mx', '$2a$10$consulta1', 'Sofía', 'Hernández', '', '4611000003', 'consulta');

-- =========================
-- PERIODOS DE PRUEBA (3 por estado)
-- =========================
INSERT INTO periods (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) VALUES
-- ACTIVE
('EJ24-01', '2024-01-15', '2024-07-01', 0, 'active', 1),
('AD24-01', '2024-08-01', '2024-12-15', 0, 'active', 2),
('EJ24-02E', '2024-01-15', '2024-07-01', 1, 'active', 1),
-- PENDING
('EJ24-03', '2024-01-15', '2024-07-01', 0, 'pending', 2),
('AD24-02', '2024-08-01', '2024-12-15', 0, 'pending', 3),
('AD24-03E', '2024-08-01', '2024-12-15', 1, 'pending', 1),
-- ENDED
('EJ23-01', '2023-01-15', '2023-07-01', 0, 'ended', 2),
('AD23-01', '2023-08-01', '2023-12-15', 0, 'ended', 3),
('EJ23-02E', '2023-01-15', '2023-07-01', 1, 'ended', 1);

-- =========================
-- USUARIOS DE PRUEBA (4 alumnos)
-- =========================
INSERT INTO users (use_nua, use_name, use_last_name, use_second_last_name, use_career, use_phone, use_email, use_password, use_sede) VALUES
(100001, 'Carlos', 'López', 'Mendoza', 'IS75LI0103', '4612000001', 'carlos.lopez@unach.mx', '$2a$10$carlos', 'SALAMANCA'),
(100002, 'María', 'García', 'Sánchez', 'IS75LI0203', '4612000002', 'maria.garcia@unach.mx', '$2a$10$maria', 'YURIRIA'),
(100003, 'José', 'Martínez', 'Pérez', 'IS75LI0303', '4612000003', 'jose.martinez@unach.mx', '$2a$10$jose', 'SALAMANCA'),
(100004, 'Laura', 'Hernández', 'Ruiz', 'IS75LI0403', '4612000004', 'laura.hernandez@unach.mx', '$2a$10$laura', 'YURIRIA');

-- =========================
-- ACTIVIDADES DE PRUEBA (1 de cada tipo por alumno en cada periodo)
-- =========================
-- Usamos imágenes de la carpeta /evidence/
-- Para simplificar, se asignan consecutivamente a periodos y alumnos

-- ACTIVIDADES PARA PERIODOS ACTIVE (sin observaciones)
INSERT INTO activities (act_name, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_observations, act_last_admin_id, act_user_id, act_period_id) VALUES
('Taller de Innovación', '2024-02-10', '2024-02-12', 12, 'UNACH', '{"fotos":["/evidence/1747795379609-8a11et.webp"]}', 'DP', 'approval', '', 2, 1, 1),
('Seminario de Liderazgo', '2024-03-05', '2024-03-07', 10, 'UNACH', '{"fotos":["/evidence/1747804756857-15ntav.webp"]}', 'RS', 'pending', '', 3, 2, 1),
('Foro de Educación', '2024-04-15', '2024-04-16', 8, 'UNACH', '{"fotos":["/evidence/1747804795180-5eewps.webp"]}', 'CEE', 'rejected', '', 2, 3, 1),
('Curso de Tecnología', '2024-05-10', '2024-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747805236754-0y0g8w.webp"]}', 'FCI', 'pending', '', 2, 4, 1),

('Taller de Innovación', '2024-09-10', '2024-09-12', 12, 'UNACH', '{"fotos":["/evidence/1747808313135-oq9fit.webp"]}', 'DP', 'approval', '', 2, 1, 2),
('Seminario de Liderazgo', '2024-10-05', '2024-10-07', 10, 'UNACH', '{"fotos":["/evidence/1747808366239-uqctja.webp"]}', 'RS', 'pending', '', 3, 2, 2),
('Foro de Educación', '2024-11-15', '2024-11-16', 8, 'UNACH', '{"fotos":["/evidence/1748413899812-j376wz.webp"]}', 'CEE', 'rejected', '', 2, 3, 2),
('Curso de Tecnología', '2024-12-10', '2024-12-12', 15, 'UNACH', '{"fotos":["/evidence/1748413899854-khtw7a.webp"]}', 'FCI', 'pending', '', 2, 4, 2),

('Taller de Innovación', '2024-02-10', '2024-02-12', 12, 'UNACH', '{"fotos":["/evidence/1748562159750-rpy7h1.webp"]}', 'DP', 'approval', '', 2, 1, 3),
('Seminario de Liderazgo', '2024-03-05', '2024-03-07', 10, 'UNACH', '{"fotos":["/evidence/1748562232149-vs34zu.webp"]}', 'RS', 'pending', '', 3, 2, 3),
('Foro de Educación', '2024-04-15', '2024-04-16', 8, 'UNACH', '{"fotos":["/evidence/1748562262417-1yav58.webp"]}', 'CEE', 'rejected', '', 2, 3, 3),
('Curso de Tecnología', '2024-05-10', '2024-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747795379609-8a11et.webp"]}', 'FCI', 'pending', '', 2, 4, 3);

-- ACTIVIDADES PARA PERIODOS PENDING (con observaciones)
INSERT INTO activities (act_name, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_observations, act_last_admin_id, act_user_id, act_period_id) VALUES
('Taller de Innovación', '2024-02-10', '2024-02-12', 12, 'UNACH', '{"fotos":["/evidence/1747804756857-15ntav.webp"]}', 'DP', 'approval', 'Falta comprobante', 2, 1, 4),
('Seminario de Liderazgo', '2024-03-05', '2024-03-07', 10, 'UNACH', '{"fotos":["/evidence/1747804795180-5eewps.webp"]}', 'RS', 'pending', 'En revisión', 3, 2, 4),
('Foro de Educación', '2024-04-15', '2024-04-16', 8, 'UNACH', '{"fotos":["/evidence/1747805236754-0y0g8w.webp"]}', 'CEE', 'rejected', 'Evidencia insuficiente', 2, 3, 4),
('Curso de Tecnología', '2024-05-10', '2024-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747808313135-oq9fit.webp"]}', 'FCI', 'pending', 'Pendiente de validación', 2, 4, 4),

('Taller de Innovación', '2024-09-10', '2024-09-12', 12, 'UNACH', '{"fotos":["/evidence/1747808366239-uqctja.webp"]}', 'DP', 'approval', 'Falta comprobante', 2, 1, 5),
('Seminario de Liderazgo', '2024-10-05', '2024-10-07', 10, 'UNACH', '{"fotos":["/evidence/1748413899812-j376wz.webp"]}', 'RS', 'pending', 'En revisión', 3, 2, 5),
('Foro de Educación', '2024-11-15', '2024-11-16', 8, 'UNACH', '{"fotos":["/evidence/1748413899854-khtw7a.webp"]}', 'CEE', 'rejected', 'Evidencia insuficiente', 2, 3, 5),
('Curso de Tecnología', '2024-12-10', '2024-12-12', 15, 'UNACH', '{"fotos":["/evidence/1748562159750-rpy7h1.webp"]}', 'FCI', 'pending', 'Pendiente de validación', 2, 4, 5),

('Taller de Innovación', '2024-02-10', '2024-02-12', 12, 'UNACH', '{"fotos":["/evidence/1748562232149-vs34zu.webp"]}', 'DP', 'approval', 'Falta comprobante', 2, 1, 6),
('Seminario de Liderazgo', '2024-03-05', '2024-03-07', 10, 'UNACH', '{"fotos":["/evidence/1748562262417-1yav58.webp"]}', 'RS', 'pending', 'En revisión', 3, 2, 6),
('Foro de Educación', '2024-04-15', '2024-04-16', 8, 'UNACH', '{"fotos":["/evidence/1747795379609-8a11et.webp"]}', 'CEE', 'rejected', 'Evidencia insuficiente', 2, 3, 6),
('Curso de Tecnología', '2024-05-10', '2024-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747804756857-15ntav.webp"]}', 'FCI', 'pending', 'Pendiente de validación', 2, 4, 6);

-- ACTIVIDADES PARA PERIODOS ENDED (con observaciones)
INSERT INTO activities (act_name, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_observations, act_last_admin_id, act_user_id, act_period_id) VALUES
('Taller de Innovación', '2023-02-10', '2023-02-12', 12, 'UNACH', '{"fotos":["/evidence/1747804795180-5eewps.webp"]}', 'DP', 'approval', 'Periodo finalizado', 2, 1, 7),
('Seminario de Liderazgo', '2023-03-05', '2023-03-07', 10, 'UNACH', '{"fotos":["/evidence/1747805236754-0y0g8w.webp"]}', 'RS', 'pending', 'Periodo finalizado', 3, 2, 7),
('Foro de Educación', '2023-04-15', '2023-04-16', 8, 'UNACH', '{"fotos":["/evidence/1747808313135-oq9fit.webp"]}', 'CEE', 'rejected', 'Periodo finalizado', 2, 3, 7),
('Curso de Tecnología', '2023-05-10', '2023-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747808366239-uqctja.webp"]}', 'FCI', 'pending', 'Periodo finalizado', 2, 4, 7),

('Taller de Innovación', '2023-09-10', '2023-09-12', 12, 'UNACH', '{"fotos":["/evidence/1748413899812-j376wz.webp"]}', 'DP', 'approval', 'Periodo finalizado', 2, 1, 8),
('Seminario de Liderazgo', '2023-10-05', '2023-10-07', 10, 'UNACH', '{"fotos":["/evidence/1748413899854-khtw7a.webp"]}', 'RS', 'pending', 'Periodo finalizado', 3, 2, 8),
('Foro de Educación', '2023-11-15', '2023-11-16', 8, 'UNACH', '{"fotos":["/evidence/1748562159750-rpy7h1.webp"]}', 'CEE', 'rejected', 'Periodo finalizado', 2, 3, 8),
('Curso de Tecnología', '2023-12-10', '2023-12-12', 15, 'UNACH', '{"fotos":["/evidence/1748562232149-vs34zu.webp"]}', 'FCI', 'pending', 'Periodo finalizado', 2, 4, 8),

('Taller de Innovación', '2023-02-10', '2023-02-12', 12, 'UNACH', '{"fotos":["/evidence/1748562262417-1yav58.webp"]}', 'DP', 'approval', 'Periodo finalizado', 2, 1, 9),
('Seminario de Liderazgo', '2023-03-05', '2023-03-07', 10, 'UNACH', '{"fotos":["/evidence/1747795379609-8a11et.webp"]}', 'RS', 'pending', 'Periodo finalizado', 3, 2, 9),
('Foro de Educación', '2023-04-15', '2023-04-16', 8, 'UNACH', '{"fotos":["/evidence/1747804756857-15ntav.webp"]}', 'CEE', 'rejected', 'Periodo finalizado', 2, 3, 9),
('Curso de Tecnología', '2023-05-10', '2023-05-12', 15, 'UNACH', '{"fotos":["/evidence/1747804795180-5eewps.webp"]}', 'FCI', 'pending', 'Periodo finalizado', 2, 4, 9);

-- =========================
-- CONTACTOS ADMINISTRATIVOS (en todos los periodos excepto los active: periodos 4-9)
-- =========================
INSERT INTO contact (con_user_id, con_admin_id, con_period_id, con_activity_id, con_description, con_observations, con_status) VALUES
-- PENDING
(1, 2, 4, 1, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 4, 2, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 4, 3, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 4, 4, 'Seguimiento', 'Pendiente', 'pending'),

(1, 2, 5, 5, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 5, 6, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 5, 7, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 5, 8, 'Seguimiento', 'Pendiente', 'pending'),

(1, 2, 6, 9, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 6, 10, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 6, 11, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 6, 12, 'Seguimiento', 'Pendiente', 'pending'),

-- ENDED
(1, 2, 7, 13, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 7, 14, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 7, 15, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 7, 16, 'Seguimiento', 'Pendiente', 'pending'),

(1, 2, 8, 17, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 8, 18, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 8, 19, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 8, 20, 'Seguimiento', 'Pendiente', 'pending'),

(1, 2, 9, 21, 'Revisión de documentación', 'Todo correcto', 'resolved'),
(2, 3, 9, 22, 'Validación de actividad', 'En proceso', 'in_progress'),
(3, 2, 9, 23, 'Observaciones generales', 'Falta evidencia', 'pending'),
(4, 2, 9, 24, 'Seguimiento', 'Pendiente', 'pending');