CREATE DATABASE proyecto_cafe;
USE proyecto_cafe;

CREATE TABLE admins (
    adm_id INT NOT NULL AUTO_INCREMENT,
    adm_email VARCHAR(100) NOT NULL,
    adm_password VARCHAR(255) NOT NULL,
    adm_name VARCHAR(50) NOT NULL,
    adm_last_name VARCHAR(50) NOT NULL,
    adm_second_last_name VARCHAR(50),
    adm_phone VARCHAR(15) NOT NULL,
    adm_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    adm_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (adm_id)
);

CREATE TABLE periods (
    per_id INT NOT NULL AUTO_INCREMENT,
    per_name VARCHAR(50) NOT NULL,
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
    ON UPDATE CASCADE
);

CREATE TABLE users (
    use_id INT NOT NULL AUTO_INCREMENT,
    use_nua INT NOT NULL,
    use_name VARCHAR(50) NOT NULL,
    use_last_name VARCHAR(50) NOT NULL,
    use_second_last_name VARCHAR(50),
    use_career ENUM('LIME', 'LIE', 'LICE', 'LIMT', 'LISC', 'LGE', 'LAD', 'LIDIA'),
    use_phone VARCHAR(15) NOT NULL,
    use_email VARCHAR(100) NOT NULL,
    use_password VARCHAR(255) NOT NULL,
    use_is_teacher BOOL NOT NULL,
    use_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    use_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (use_id)
);

CREATE TABLE activities (
    act_id INT NOT NULL AUTO_INCREMENT,
    act_name VARCHAR(100) NOT NULL,
    act_speaker VARCHAR(100),
    act_description MEDIUMTEXT NOT NULL,
    act_date_start DATE NOT NULL,
    act_date_end DATE NOT NULL,
    act_hours INT NOT NULL,
    act_institution VARCHAR(100) NOT NULL,
    act_evidence JSON NOT NULL,
    act_area ENUM('dp', 'rs', 'cee', 'fci', 'ac') NOT NULL,
    act_status ENUM('approval', 'pending', 'rejected') NOT NULL,
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
    ON UPDATE CASCADE
);

CREATE TABLE collectives (
    col_id INT NOT NULL AUTO_INCREMENT,
    col_event VARCHAR(100) NOT NULL,
    col_institution VARCHAR(100) NOT NULL,
    col_place VARCHAR(100) NOT NULL,
    col_hours INT NOT NULL,
    col_date DATE NOT NULL,
    col_authorization VARCHAR(100) NOT NULL,
    col_signatures_format VARCHAR(100) NOT NULL,
    col_evidence JSON NOT NULL,
    col_area ENUM('dp', 'rs', 'cee', 'fci', 'ac') NOT NULL,
    col_status ENUM('approval', 'pending', 'rejected') NOT NULL,
    col_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    col_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    col_user_id INT NOT NULL,
    col_period_id INT NOT NULL,
    PRIMARY KEY (col_id),
    CONSTRAINT fk_collective_user FOREIGN KEY (col_user_id) 
    REFERENCES users(use_id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
    CONSTRAINT fk_collective_period FOREIGN KEY (col_period_id) 
    REFERENCES periods(per_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Indices para optimizar búsquedas frecuentes
CREATE INDEX idx_use_nua ON users(use_nua);
CREATE INDEX idx_use_email ON users(use_email);
CREATE INDEX idx_act_area ON activities(act_area);
CREATE INDEX idx_col_area ON collectives(col_area);
CREATE INDEX idx_activities_period ON activities(act_period_id);
CREATE INDEX idx_collectives_period ON collectives(col_period_id);
CREATE INDEX idx_act_user ON activities(act_user_id);
CREATE INDEX idx_col_user ON collectives(col_user_id);
CREATE INDEX idx_per_status ON periods(per_status);
CREATE INDEX idx_act_status ON activities(act_status);
CREATE INDEX idx_col_status ON collectives(col_status);

-- Restricciones UNIQUE
ALTER TABLE users ADD CONSTRAINT unique_use_nua UNIQUE (use_nua);
ALTER TABLE users ADD CONSTRAINT unique_use_email UNIQUE (use_email);
ALTER TABLE admins ADD CONSTRAINT unique_adm_email UNIQUE (adm_email);
ALTER TABLE periods ADD CONSTRAINT unique_per_name UNIQUE (per_name);

-- Restricciones CHECK para validación de datos
ALTER TABLE periods ADD CONSTRAINT chk_period_dates CHECK (per_date_start < per_date_end);
ALTER TABLE activities ADD CONSTRAINT chk_activity_dates CHECK (act_date_start <= act_date_end);
ALTER TABLE activities ADD CONSTRAINT chk_activity_hours CHECK (act_hours > 0);
ALTER TABLE collectives ADD CONSTRAINT chk_collective_hours CHECK (col_hours > 0);

-- Script para insertar datos de prueba en la base de datos proyecto_cafe

-- Datos para la tabla admins
INSERT INTO admins (adm_email, adm_password, adm_name, adm_last_name, adm_second_last_name, adm_phone) VALUES
('admin.principal@cafe.uaa.mx', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e84HFHpxx.M7TPvBkx', 'María', 'González', 'Sánchez', '4491234567'),
('admin.soporte@cafe.uaa.mx', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e84HFmS8uTX2BkSZQT', 'Juan', 'Pérez', 'López', '4499876543'),
('admin.sistemas@cafe.uaa.mx', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e84HF.9oaji2qbWpKKR', 'Roberto', 'Martínez', 'Flores', '4492345678'),
('coordinador@cafe.uaa.mx', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e84HFow02pzixJZMG', 'Laura', 'Ramírez', 'Torres', '4498765432'),
('director@cafe.uaa.mx', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e84HFpow8ZahJKimgh', 'Carlos', 'Hernández', 'García', '4493456789');

-- Datos para la tabla periods
INSERT INTO periods (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) VALUES
('EJ24-1E', '2024-01-15', '2024-06-30', TRUE, 'active', 1),
('AJ24-2E', '2024-07-01', '2024-12-15', FALSE, 'pending', 2),
('EJ25-1E', '2025-01-15', '2025-06-30', TRUE, 'pending', 1),
('AJ23-2E', '2023-07-01', '2023-12-15', FALSE, 'ended', 3),
('EJ23-1E', '2023-01-16', '2023-06-29', TRUE, 'ended', 4);

-- Datos para la tabla users (estudiantes y profesores)
INSERT INTO users (use_nua, use_name, use_last_name, use_second_last_name, use_career, use_phone, use_email, use_password, use_is_teacher) VALUES
-- Estudiantes
(269123, 'Ana', 'López', 'Martínez', 'LIME', '4491122334', 'ana.lopez@edu.uaa.mx', '$2a$10$xJz2wSx3eDc4rFv5tGb5e84HFqertyw22BkSZQT', FALSE),
(272345, 'Miguel', 'García', 'Rodríguez', 'LIE', '4492233445', 'miguel.garcia@edu.uaa.mx', '$2a$10$2Ccx3wSx3eDc4rFv5tGb5e84HFghy6tywpKKR', FALSE),
(265678, 'Sofía', 'Hernández', 'Pérez', 'LICE', '4493344556', 'sofia.hernandez@edu.uaa.mx', '$2a$10$3q3z2wSx3eDc4rFv5tGb5e84HFp09jKimgh', FALSE),
(277890, 'Daniel', 'Torres', 'Gómez', 'LIMT', '4494455667', 'daniel.torres@edu.uaa.mx', '$2a$10$4yAt2wSx3eDc4rFv5tGb5e84HF09utX2BkSZQT', FALSE),
(271234, 'Laura', 'Ramírez', 'Sánchez', 'LISC', '4495566778', 'laura.ramirez@edu.uaa.mx', '$2a$10$5U2t2wSx3eDc4rFv5tGb5e84HFBw22pzixJZMG', FALSE),
(268901, 'Carlos', 'Flores', 'Vargas', 'LGE', '4496677889', 'carlos.flores@edu.uaa.mx', '$2a$10$6z1q2wSx3eDc4rFv5tGb5e84HFpow8ZahJKimgh', FALSE),
(273456, 'Gabriela', 'Vázquez', 'Morales', 'LAD', '4497788990', 'gabriela.vazquez@edu.uaa.mx', '$2a$10$7WA2wSx3eDc4rFv5tGb5e84HFmS8uTX2BkSZQT', FALSE),
(274567, 'Eduardo', 'Castro', 'Luna', 'LIDIA', '4498899001', 'eduardo.castro@edu.uaa.mx', '$2a$10$8B4q2wSx3eDc4rFv5tGb5e84HFpxx.M7TPvBkx', FALSE),
-- Profesores
(123456, 'Alejandro', 'Méndez', 'Ríos', NULL, '4491234987', 'alejandro.mendez@edu.uaa.mx', '$2a$10$9z1q2wSx3eDc4rFv5tGb5e84HFBw22pzixJZMG', TRUE),
(134567, 'Patricia', 'Jiménez', 'Ortiz', NULL, '4492345098', 'patricia.jimenez@edu.uaa.mx', '$2a$10$0UYt2wSx3eDc4rFv5tGb5e84HF.9oaji2qbWpKKR', TRUE);

-- Datos para la tabla activities
INSERT INTO activities (act_name, act_speaker, act_description, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_user_id, act_period_id) VALUES
('Conferencia Inteligencia Artificial', 'Dr. Manuel Cortés', 'Conferencia sobre los avances recientes en inteligencia artificial y su aplicación en la educación', '2024-02-15', '2024-02-15', 4, 'Universidad Autónoma de Aguascalientes', '{"constancia": "constancia_ia.pdf", "fotos": ["foto1.jpg", "foto2.jpg"]}', 'fci', 'approval', 1, 1),
('Taller de Diseño Web', 'Mtra. Lucía Fernández', 'Taller práctico para aprender a diseñar sitios web responsivos con las últimas tecnologías', '2024-03-10', '2024-03-12', 12, 'Universidad Autónoma de Aguascalientes', '{"constancia": "constancia_web.pdf", "proyecto": "proyecto_final.zip"}', 'dp', 'approval', 2, 1),
('Seminario de Investigación Educativa', 'Dr. Ricardo Sánchez', 'Seminario orientado a métodos de investigación aplicados a la educación', '2024-04-05', '2024-04-06', 8, 'Instituto de Investigación Educativa', '{"constancia": "constancia_seminario.pdf"}', 'rs', 'pending', 3, 1),
('Curso de Herramientas Digitales', 'Ing. Carmen Ortiz', 'Curso intensivo sobre herramientas digitales para la docencia en línea', '2024-05-20', '2024-05-22', 15, 'Centro de Capacitación Docente', '{"constancia": "constancia_herramientas.pdf", "material": "material_curso.pdf"}', 'fci', 'approval', 4, 1),
('Congreso de Innovación Educativa', 'Varios ponentes', 'Congreso internacional sobre nuevas metodologías y tecnologías en la educación', '2023-09-15', '2023-09-17', 20, 'Asociación de Innovación Educativa', '{"constancia": "constancia_congreso.pdf", "memoria": "memoria_congreso.pdf"}', 'cee', 'approval', 5, 4),
('Workshop de Creatividad', 'Lic. Antonio Mendoza', 'Workshop para desarrollar habilidades creativas aplicadas a la enseñanza', '2023-10-10', '2023-10-10', 5, 'Centro Cultural Universitario', '{"constancia": "constancia_workshop.pdf", "proyecto": "proyecto_creatividad.pdf"}', 'ac', 'rejected', 6, 4),
('Curso de Estrategias Didácticas', 'Dra. Silvia Torres', 'Curso sobre estrategias didácticas innovadoras para el aula', '2023-11-05', '2023-11-07', 12, 'Facultad de Educación', '{"constancia": "constancia_estrategias.pdf"}', 'dp', 'approval', 7, 4),
('Diplomado en Evaluación Educativa', 'Varios especialistas', 'Diplomado enfocado en técnicas y métodos de evaluación en educación superior', '2023-08-01', '2023-12-01', 120, 'Universidad Autónoma de Aguascalientes', '{"constancia": "constancia_diplomado.pdf", "proyecto_final": "evaluacion_final.pdf"}', 'rs', 'pending', 8, 4);

-- Datos para la tabla collectives
INSERT INTO collectives (col_event, col_institution, col_place, col_hours, col_date, col_authorization, col_signatures_format, col_evidence, col_area, col_status, col_user_id, col_period_id) VALUES
('Jornada de Inclusión Digital', 'Universidad Autónoma de Aguascalientes', 'Auditorio Central', 6, '2024-02-28', 'JDGT/2024-028', 'formato_firmas_jid.pdf', '{"registro": "registro_asistentes.pdf", "fotos": ["jornada1.jpg", "jornada2.jpg"]}', 'fci', 'approval', 1, 1),
('Taller Colectivo de Programación', 'Facultad de Sistemas', 'Laboratorio A', 8, '2024-03-15', 'TCPT/2024-045', 'formato_firmas_tcp.pdf', '{"registro": "lista_participantes.pdf", "codigo": "proyectos.zip"}', 'dp', 'pending', 2, 1),
('Encuentro de Estudiantes de Educación', 'Departamento de Educación', 'Sala Magna', 5, '2024-04-20', 'EEE/2024-067', 'formato_firmas_eee.pdf', '{"memoria": "memoria_encuentro.pdf", "fotos": ["encuentro1.jpg"]}', 'rs', 'approval', 3, 1),
('Foro de Innovación Tecnológica', 'Centro de Tecnología Educativa', 'Centro de Congresos', 7, '2023-09-25', 'FIT/2023-089', 'formato_firmas_fit.pdf', '{"registro": "asistentes_foro.pdf", "presentaciones": "ponencias.zip"}', 'fci', 'pending', 4, 4),
('Festival Cultural Universitario', 'Departamento de Extensión Cultural', 'Plaza Central', 10, '2023-10-15', 'FCU/2023-103', 'formato_firmas_fcu.pdf', '{"programa": "programa_actividades.pdf", "fotos": ["festival1.jpg", "festival2.jpg"]}', 'ac', 'approval', 5, 4),
('Simposio de Investigación Educativa', 'Instituto de Investigación', 'Auditorio 2', 12, '2023-11-10', 'SIE/2023-128', 'formato_firmas_sie.pdf', '{"memoria": "memoria_simposio.pdf", "ponencias": "ponencias_simposio.zip"}', 'cee', 'approval', 6, 4);