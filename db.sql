CREATE DATABASE proyecto_cafe;
USE proyecto_cafe;

CREATE TABLE admins (
    adm_id INT NOT NULL AUTO_INCREMENT,
    adm_correo VARCHAR(100) NOT NULL,
    adm_password VARCHAR(255) NOT NULL,
    adm_name VARCHAR(50) NOT NULL,
    adm_last_name VARCHAR(50) NOT NULL,
    adm_second_last_name VARCHAR(50),
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
    FOREIGN KEY (per_create_admin_id) REFERENCES admins(adm_id)
);

CREATE TABLE users (
    use_id INT NOT NULL AUTO_INCREMENT,
    use_nua INT NOT NULL,
    use_name VARCHAR(50) NOT NULL,
    use_last_name VARCHAR(50) NOT NULL,
    use_second_last_name VARCHAR(50),
    use_email VARCHAR(100) NOT NULL,
    use_password VARCHAR(255) NOT NULL,
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
    FOREIGN KEY (act_user_id) REFERENCES users(use_id),
    FOREIGN KEY (act_period_id) REFERENCES periods(per_id)
);

CREATE TABLE collectives (
    col_id INT NOT NULL AUTO_INCREMENT,
    col_event VARCHAR(100) NOT NULL,
    col_institution VARCHAR(100) NOT NULL,
    col_place VARCHAR(100) NOT NULL,
    col_hours INT NOT NULL,
    col_date DATE NOT NULL,
    col_authorization VARCHAR(100) NOT NULL,
    col_evidence JSON NOT NULL,
    col_area ENUM('dp', 'rs', 'cee', 'fci', 'ac') NOT NULL,
    col_status ENUM('approval', 'pending', 'rejected') NOT NULL,
    col_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    col_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    col_user_id INT NOT NULL,
    col_period_id INT NOT NULL,
    PRIMARY KEY (col_id),
    FOREIGN KEY (col_user_id) REFERENCES users(use_id),
    FOREIGN KEY (col_period_id) REFERENCES periods(per_id)
);

-- Insertar datos de administradores
INSERT INTO admins (adm_correo, adm_password, adm_name, adm_last_name, adm_second_last_name) VALUES
('admin1@universidad.edu', '$2a$12$1HqHxm3QTkBxZ1lS5vZ3k.4ZE3jB5fChH0hV96ft.gFfmHZxbx.pq', 'Juan', 'Pérez', 'Gómez'),
('admin2@universidad.edu', '$2a$12$cvPm90dgBzFLbXk5Svk/CeNR3ymL8rTkTZgqgRlF4gU5jdgBXmI3i', 'María', 'Rodríguez', 'López'),
('admin3@universidad.edu', '$2a$12$KmnA.cRjA9hdduDWxIBvs.282UfI3YidkUZ91Qq4BoE3EJdFkxlsS', 'Carlos', 'González', 'Martínez'),
('admin4@universidad.edu', '$2a$12$UUQkJA0PtAzE2zvA4q3zxu4h0Inrn1ZdS3VRlBnJpB2vT9jpLR12.', 'Laura', 'Fernández', 'Sánchez'),
('admin5@universidad.edu', '$2a$12$FdESaCrvFiUnKOwf1.FfC.6NzGmoFeG7Jmzm4LlF7fr.GpXqsrEXK', 'Roberto', 'Díaz', 'Hernández');

-- Insertar datos de periodos (formato modificado)
INSERT INTO periods (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) VALUES
('EJ24-1E', '2024-01-15', '2024-05-30', TRUE, 'ended', 1),
('AD24-1E', '2024-08-12', '2024-12-20', TRUE, 'active', 2),
('EJ25-1E', '2025-01-13', '2025-05-28', TRUE, 'pending', 3),
('AD25-1', '2025-08-10', '2025-12-18', FALSE, 'pending', 4),
('EJ26-1', '2026-01-11', '2026-05-29', FALSE, 'pending', 5);

-- 1. Primero asegurémonos que tenemos los usuarios correctamente insertados
INSERT INTO users (use_id, use_nua, use_name, use_last_name, use_second_last_name, use_email, use_password) VALUES
(1, 101546, 'Ana', 'Martínez', 'Torres', 'a.martinez@alumnos.edu', '$2a$12$B4g9S8XmL3Lh0XqiaZj2RODShXJV1OJ8XULJvBKhbxTPyh0xM.x8.'),
(2, 102358, 'Pedro', 'Sánchez', 'Vega', 'p.sanchez@alumnos.edu', '$2a$12$lqPkf57ZrL4vbfW7UjGrJ.DpBKr/hgkrbxzPjpXOX4LMNZmkn2Zki'),
(3, 103789, 'Lucía', 'Gómez', 'Ruiz', 'l.gomez@alumnos.edu', '$2a$12$4mSYZXrz6jXMo8RdsfYmD.EJvJD9rEAI8ktV7NvG7rDfvhVn8jmuK'),
(4, 104234, 'Miguel', 'López', 'García', 'm.lopez@alumnos.edu', '$2a$12$rJFLkKPqwTf.WTGczH9.XOFajJxd6G8MRKNh3U48bNQcZ6hJ1LEEG'),
(5, 105876, 'Claudia', 'Hernández', 'Flores', 'c.hernandez@alumnos.edu', '$2a$12$Ty.PrzZErxFSfjVrhD4rKerYKB5YF95gY4q6Z57M4Wk9JVlP4B5ZK'),
(6, 106432, 'Jorge', 'Ramírez', 'Díaz', 'j.ramirez@alumnos.edu', '$2a$12$jm3CwUL6K1sYO9Y0Kf0YluUPYPz6zrwKezS2GJrHJWBxvwxxYYZ0K'),
(7, 107985, 'Daniela', 'Ortiz', 'Miranda', 'd.ortiz@alumnos.edu', '$2a$12$5o9NhkHYfNBgi.hZpJC6SOeSnDHfMh08H3ebN5iSZuJr8P1.0OqSm'),
(8, 108321, 'Alejandro', 'Vargas', 'Mendoza', 'a.vargas@alumnos.edu', '$2a$12$bhpUqA/7SVJ/nx39hjQ1LeYG.WHuPGLO0wuSjLN5Xq438DpaieP.q'),
(9, 109765, 'Sofía', 'Cruz', 'Jiménez', 's.cruz@alumnos.edu', '$2a$12$sFh9uTAE04w.cu7/IfyzQe2cguh9N.zjjzxJFplt1Jju6gZ/AGxvK'),
(10, 110432, 'David', 'Morales', 'Castillo', 'd.morales@alumnos.edu', '$2a$12$QZhkIkwcKrQy45wCVMJheOB7r8SQcgvjjezXQCTeAROaHOjXKW.xG');

-- 2. Asegúrate que el último periodo se inserta correctamente
INSERT INTO periods (per_name, per_date_start, per_date_end, per_exclusive, per_status, per_create_admin_id) VALUES
('EJ26-1', '2026-01-11', '2026-05-29', FALSE, 'pending', 5);

-- 3. Ahora podemos insertar los colectivos con seguridad
INSERT INTO collectives (col_event, col_institution, col_place, col_hours, col_date, col_authorization, col_evidence, col_area, col_status, col_user_id, col_period_id) VALUES
('Limpieza de parques', 'Ayuntamiento Municipal', 'Parque Central', 6, '2024-02-25', 'https://example.com/docs/auth_parques_2024.pdf', '{"images": ["https://imgur.com/b12cD3E", "https://imgur.com/f45gH6I"]}', 'rs', 'approval', 1, 1),
('Apoyo a damnificados', 'Cruz Roja', 'Zona Norte', 8, '2024-03-18', 'https://example.com/docs/auth_cruzroja_2024.pdf', '{"images": ["https://imgur.com/j78kL9M", "https://imgur.com/n23oP4Q"]}', 'rs', 'pending', 2, 1),
('Feria de ciencias', 'Secretaría de Educación', 'Escuela Primaria "Benito Juárez"', 5, '2024-04-05', 'https://example.com/docs/auth_feria_ciencias_2024.pdf', '{"images": ["https://imgur.com/r56sT7U", "https://imgur.com/v89wX0Y"]}', 'fci', 'approval', 3, 1),
('Talleres de computación', 'DIF Municipal', 'Centro Comunitario "Esperanza"', 10, '2024-09-28', 'https://example.com/docs/auth_talleres_comp_2024.pdf', '{"images": ["https://imgur.com/z34aB5C", "https://imgur.com/b67cD8E"]}', 'dp', 'pending', 4, 2),
('Campaña de reforestación', 'Secretaría de Medio Ambiente', 'Reserva Ecológica', 7, '2024-10-15', 'https://example.com/docs/auth_reforestacion_2024.pdf', '{"images": ["https://imgur.com/f90gH1I", "https://imgur.com/j23kL4M"]}', 'rs', 'approval', 5, 2),
('Festival cultural universitario', 'Universidad Autónoma', 'Plaza Central', 12, '2024-11-10', 'https://example.com/docs/auth_festival_2024.pdf', '{"images": ["https://imgur.com/n56oP7Q", "https://imgur.com/r89sT0U"]}', 'ac', 'pending', 6, 2),
('Jornada de vacunación', 'Secretaría de Salud', 'Centro de Salud Municipal', 6, '2025-02-08', 'https://example.com/docs/auth_vacunacion_2025.pdf', '{"images": ["https://imgur.com/v34wX5Y", "https://imgur.com/z67aB8C"]}', 'rs', 'pending', 7, 3),
('Congreso de innovación', 'Consejo de Ciencia y Tecnología', 'Centro de Congresos', 15, '2025-03-20', 'https://example.com/docs/auth_congreso_2025.pdf', '{"images": ["https://imgur.com/d90eF1G", "https://imgur.com/h23iJ4K"]}', 'cee', 'pending', 8, 3),
('Maratón de programación', 'Asociación de Desarrolladores', 'Campus Tecnológico', 24, '2025-04-15', 'https://example.com/docs/auth_maraton_2025.pdf', '{"images": ["https://imgur.com/l56mN7O", "https://imgur.com/p89qR0S"]}', 'dp', 'pending', 9, 3),
('Torneo deportivo interuniversitario', 'Consejo del Deporte Universitario', 'Polideportivo Central', 8, '2024-05-22', 'https://example.com/docs/auth_torneo_2024.pdf', '{"images": ["https://imgur.com/t34uV5W", "https://imgur.com/x67yZ8A"]}', 'ac', 'approval', 10, 1);

-- 4. Finalmente, insertamos las actividades
INSERT INTO activities (act_name, act_speaker, act_description, act_date_start, act_date_end, act_hours, act_institution, act_evidence, act_area, act_status, act_user_id, act_period_id) VALUES
('Taller de programación web', 'Dr. Manuel Vázquez', 'Taller práctico sobre desarrollo de aplicaciones web usando tecnologías modernas', '2024-02-10', '2024-02-15', 20, 'Facultad de Ingeniería', '{"images": ["https://imgur.com/a12bC3D", "https://imgur.com/d45eF6G"]}', 'dp', 'approval', 1, 1),
('Conferencia de IA aplicada', 'Dra. Patricia Guerra', 'Conferencia sobre avances recientes en inteligencia artificial y sus aplicaciones', '2024-03-05', '2024-03-05', 4, 'Centro de Investigaciones', '{"images": ["https://imgur.com/h78iJ9K", "https://imgur.com/l23mN4O"]}', 'fci', 'pending', 2, 1),
('Hackathon universitario', NULL, 'Evento de 48 horas para desarrollar soluciones tecnológicas a problemas sociales', '2024-04-20', '2024-04-22', 48, 'Campus Central', '{"images": ["https://imgur.com/p56qR7S", "https://imgur.com/t89uV2W"]}', 'cee', 'approval', 3, 1),
('Curso de bases de datos', 'Mtro. Alberto Soto', 'Curso intensivo sobre diseño y optimización de bases de datos relacionales', '2024-09-15', '2024-09-30', 30, 'Facultad de Informática', '{"images": ["https://imgur.com/x34yZ5A", "https://imgur.com/b67cD8E"]}', 'dp', 'pending', 4, 2),
('Seminario de ética profesional', 'Dr. Fernando Torres', 'Seminario sobre ética en la práctica profesional y responsabilidad social', '2024-10-08', '2024-10-09', 8, 'Auditorio General', '{"images": ["https://imgur.com/f90gH1I", "https://imgur.com/j23kL4M"]}', 'rs', 'approval', 5, 2),
('Taller de emprendimiento', 'Lic. Rosa Mendoza', 'Taller práctico para desarrollar habilidades emprendedoras y plan de negocios', '2024-11-12', '2024-11-14', 15, 'Centro de Emprendedores', '{"images": ["https://imgur.com/n56oP7Q", "https://imgur.com/r89sT0U"]}', 'cee', 'rejected', 6, 2),
('Coloquio de investigación', 'Varios ponentes', 'Presentación de avances de investigación en diferentes áreas científicas', '2025-02-20', '2025-02-22', 12, 'Instituto de Ciencias', '{"images": ["https://imgur.com/v34wX5Y", "https://imgur.com/z67aB8C"]}', 'fci', 'pending', 7, 3),
('Curso de gestión de proyectos', 'Ing. Laura Estrada', 'Curso sobre metodologías ágiles para gestión efectiva de proyectos', '2025-03-18', '2025-03-25', 25, 'Facultad de Administración', '{"images": ["https://imgur.com/d90eF1G", "https://imgur.com/h23iJ4K"]}', 'dp', 'pending', 8, 3),
('Taller de habilidades blandas', 'Psic. Carlos Mejía', 'Taller para desarrollar comunicación efectiva y trabajo en equipo', '2025-04-10', '2025-04-12', 10, 'Centro de Desarrollo Humano', '{"images": ["https://imgur.com/l56mN7O", "https://imgur.com/p89qR0S"]}', 'ac', 'pending', 9, 3),
('Simposio de innovación tecnológica', 'Varios especialistas', 'Simposio internacional sobre tendencias en innovación tecnológica', '2024-05-15', '2024-05-17', 18, 'Centro de Convenciones', '{"images": ["https://imgur.com/t34uV5W", "https://imgur.com/x67yZ8A"]}', 'fci', 'approval', 10, 1);