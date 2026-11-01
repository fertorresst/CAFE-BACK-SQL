-- Tabla para los códigos de recuperación de contraseña de los estudiantes.
-- Ejecutar una sola vez en MySQL Workbench.
USE cafe;

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
