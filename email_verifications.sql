-- Tabla para los códigos de verificación de correo (registro de estudiantes).
-- Ejecutar una sola vez en MySQL Workbench.
USE cafe;

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
