-- ============================================================
-- MIGRACIÓN: Actualizar rutas de códigos QR a rutas relativas
-- ============================================================
-- Este script actualiza las rutas absolutas de códigos QR existentes
-- a rutas relativas para facilitar el acceso desde el frontend
-- 
-- IMPORTANTE: Ejecutar solo si ya tienes datos en la tabla qr_codes
-- con rutas absolutas del sistema de archivos
-- ============================================================

USE cafe;

-- Actualizar rutas que contienen la ruta completa del sistema
-- Ejemplo: C:\Users\...\uploads\qr-codes\archivo.png -> /qr-codes/archivo.png
UPDATE qr_codes
SET qr_image_path = CONCAT('/qr-codes/', SUBSTRING_INDEX(qr_image_path, '\\', -1))
WHERE qr_image_path LIKE '%uploads\\qr-codes\\%';

-- Para sistemas Unix/Linux (con barras normales)
UPDATE qr_codes
SET qr_image_path = CONCAT('/qr-codes/', SUBSTRING_INDEX(qr_image_path, '/', -1))
WHERE qr_image_path LIKE '%uploads/qr-codes/%'
  AND qr_image_path NOT LIKE '/qr-codes/%';

-- Verificar los cambios
SELECT qr_id, qr_career, qr_area, qr_image_path 
FROM qr_codes;

-- ============================================================
-- NOTAS:
-- - Después de ejecutar esta migración, las rutas se verán así:
--   /qr-codes/IS75LI0103_DP-VSS_a1b2c3d4.png
-- - Estas rutas son accesibles directamente desde el frontend:
--   http://localhost:5000/qr-codes/IS75LI0103_DP-VSS_a1b2c3d4.png
-- ============================================================
