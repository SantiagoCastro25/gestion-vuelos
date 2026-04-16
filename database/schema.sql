-- ============================================================
-- FLIGHT MANAGEMENT SYSTEM - Schema SQL
-- Base de datos para XAMPP/MySQL
-- Ejecutar en phpMyAdmin o MySQL CLI
-- ============================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS flights_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE flights_management;

-- ============================================================
-- TABLA: vuelos
-- ============================================================
CREATE TABLE IF NOT EXISTS vuelos (
    id                  INT             NOT NULL AUTO_INCREMENT,
    numero_vuelo        VARCHAR(10)     NOT NULL UNIQUE,
    aerolinea           VARCHAR(100)    NOT NULL,
    origen              VARCHAR(100)    NOT NULL,
    destino             VARCHAR(100)    NOT NULL,
    fecha_salida        DATETIME        NOT NULL,
    fecha_llegada       DATETIME        NOT NULL,
    capacidad           INT             NOT NULL DEFAULT 150,
    asientos_disponibles INT            NOT NULL DEFAULT 150,
    estado              ENUM('programado','embarcando','en_vuelo','aterrizado','cancelado')
                                        NOT NULL DEFAULT 'programado',
    terminal            VARCHAR(10)     DEFAULT NULL,
    puerta              VARCHAR(10)     DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_vuelos_estado (estado),
    INDEX idx_vuelos_fecha (fecha_salida)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: pasajeros
-- ============================================================
CREATE TABLE IF NOT EXISTS pasajeros (
    id              INT             NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(100)    NOT NULL,
    apellido        VARCHAR(100)    NOT NULL,
    documento       VARCHAR(20)     NOT NULL UNIQUE,
    tipo_documento  ENUM('cedula','pasaporte','tarjeta_id')
                                    NOT NULL DEFAULT 'cedula',
    email           VARCHAR(150)    NOT NULL,
    telefono        VARCHAR(20)     DEFAULT NULL,
    nacionalidad    VARCHAR(100)    DEFAULT 'Colombia',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_pasajeros_documento (documento)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: reservas
-- ============================================================
CREATE TABLE IF NOT EXISTS reservas (
    id              INT             NOT NULL AUTO_INCREMENT,
    vuelo_id        INT             NOT NULL,
    pasajero_id     INT             NOT NULL,
    asiento         VARCHAR(5)      DEFAULT NULL,
    clase           ENUM('economica','ejecutiva','primera')
                                    NOT NULL DEFAULT 'economica',
    estado          ENUM('confirmada','cancelada','pendiente','completada')
                                    NOT NULL DEFAULT 'confirmada',
    precio          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    fecha_reserva   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reserva_vuelo
        FOREIGN KEY (vuelo_id) REFERENCES vuelos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reserva_pasajero
        FOREIGN KEY (pasajero_id) REFERENCES pasajeros(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_vuelo_asiento (vuelo_id, asiento),
    INDEX idx_reservas_vuelo (vuelo_id),
    INDEX idx_reservas_pasajero (pasajero_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: tripulacion
-- ============================================================
CREATE TABLE IF NOT EXISTS tripulacion (
    id          INT             NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100)    NOT NULL,
    apellido    VARCHAR(100)    NOT NULL,
    rol         ENUM('piloto','copiloto','sobrecargo','asistente_vuelo')
                                NOT NULL DEFAULT 'asistente_vuelo',
    licencia    VARCHAR(50)     DEFAULT NULL,
    email       VARCHAR(150)    DEFAULT NULL,
    telefono    VARCHAR(20)     DEFAULT NULL,
    vuelo_id    INT             DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tripulacion_vuelo
        FOREIGN KEY (vuelo_id) REFERENCES vuelos(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_tripulacion_vuelo (vuelo_id)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS DE EJEMPLO (SEED DATA)
-- ============================================================

-- Vuelos de ejemplo
INSERT INTO vuelos (numero_vuelo, aerolinea, origen, destino, fecha_salida, fecha_llegada, capacidad, asientos_disponibles, estado, terminal, puerta) VALUES
('AV101',  'Avianca',          'Bogotá (BOG)',     'Medellín (MDE)',   '2026-04-16 06:00:00', '2026-04-16 07:05:00', 180, 45,  'embarcando', 'T1', 'G12'),
('AV205',  'Avianca',          'Bogotá (BOG)',     'Cartagena (CTG)',  '2026-04-16 08:30:00', '2026-04-16 09:45:00', 160, 120, 'programado',  'T1', 'G08'),
('LA340',  'LATAM',            'Bogotá (BOG)',     'Cali (CLO)',       '2026-04-16 10:15:00', '2026-04-16 11:10:00', 200, 88,  'programado',  'T2', 'F04'),
('VX512',  'Viva Air',         'Bogotá (BOG)',     'Barranquilla (BAQ)','2026-04-16 12:00:00','2026-04-16 13:05:00', 180, 150, 'programado',  'T2', 'F11'),
('AV888',  'Avianca',          'Medellín (MDE)',   'Bogotá (BOG)',     '2026-04-16 14:45:00', '2026-04-16 15:50:00', 180, 0,   'en_vuelo',    'T1', 'G02'),
('LA777',  'LATAM',            'Cali (CLO)',       'Lima (LIM)',       '2026-04-16 16:30:00', '2026-04-16 20:00:00', 260, 210, 'programado',  'T2', 'F19'),
('IB900',  'Iberia',           'Bogotá (BOG)',     'Madrid (MAD)',     '2026-04-16 22:00:00', '2026-04-17 14:30:00', 300, 75,  'programado',  'T3', 'I01'),
('AV002',  'Avianca',          'Bogotá (BOG)',     'Miami (MIA)',      '2026-04-16 09:00:00', '2026-04-16 13:30:00', 250, 180, 'programado',  'T1', 'G22'),
('CM310',  'Copa Airlines',    'Bogotá (BOG)',     'Panamá (PTY)',     '2026-04-16 07:45:00', '2026-04-16 09:15:00', 150, 62,  'programado',  'T2', 'F03'),
('AV055',  'Avianca',          'Bogotá (BOG)',     'Pereira (PEI)',    '2026-04-16 17:20:00', '2026-04-16 18:05:00', 100, 100, 'cancelado',   'T1', 'G15');

-- Pasajeros de ejemplo
INSERT INTO pasajeros (nombre, apellido, documento, tipo_documento, email, telefono, nacionalidad) VALUES
('Santiago', 'Gómez',      '1020304050', 'cedula',    'santiago.gomez@email.com',    '3001234567', 'Colombia'),
('María',    'López',      '9876543210', 'cedula',    'maria.lopez@email.com',       '3109876543', 'Colombia'),
('Carlos',   'Rodríguez',  'AB123456',   'pasaporte', 'carlos.rod@email.com',        '3151122334', 'Venezuela'),
('Ana',      'Martínez',   '5544332211', 'cedula',    'ana.martinez@email.com',      '3204455667', 'Colombia'),
('Luis',     'Hernández',  'PP987654',   'pasaporte', 'luis.h@email.com',            NULL,         'México'),
('Valentina','Pérez',      '1122334455', 'cedula',    'valentin.perez@email.com',    '3116677889', 'Colombia'),
('Jorge',    'García',     '6677889900', 'cedula',    'jorge.garcia@email.com',      '3001112233', 'Colombia'),
('Laura',    'Torres',     'US445566',   'pasaporte', 'laura.torres@email.com',      NULL,         'Estados Unidos');

-- Reservas de ejemplo
INSERT INTO reservas (vuelo_id, pasajero_id, asiento, clase, estado, precio) VALUES
(1, 1, '12A', 'economica',  'confirmada', 320000.00),
(1, 2, '12B', 'economica',  'confirmada', 320000.00),
(2, 3, '05C', 'ejecutiva',  'confirmada', 850000.00),
(2, 4, '05D', 'ejecutiva',  'confirmada', 850000.00),
(3, 5, '22F', 'economica',  'confirmada', 280000.00),
(5, 6, '01A', 'primera',    'confirmada', 1500000.00),
(7, 7, '14B', 'ejecutiva',  'confirmada', 3200000.00),
(8, 8, '30E', 'economica',  'pendiente',  750000.00);

-- Tripulación de ejemplo
INSERT INTO tripulacion (nombre, apellido, rol, licencia, email, vuelo_id) VALUES
('Roberto',  'Vargas',   'piloto',          'PIL-COL-001', 'r.vargas@avianca.com',  1),
('Diana',    'Castillo', 'copiloto',        'CPL-COL-045', 'd.castillo@avianca.com',1),
('Patricia', 'Ruiz',     'sobrecargo',      NULL,          'p.ruiz@avianca.com',    1),
('Mario',    'Sánchez',  'asistente_vuelo', NULL,          'm.sanchez@avianca.com', 1),
('Felipe',   'Moreno',   'piloto',          'PIL-COL-078', 'f.moreno@latam.com',    3),
('Claudia',  'Jiménez',  'copiloto',        'CPL-COL-112', 'c.jimenez@latam.com',   3),
('Andrés',   'Ríos',     'sobrecargo',      NULL,          'a.rios@iberia.com',     7),
('Sofía',    'Vega',     'asistente_vuelo', NULL,          's.vega@iberia.com',     7);

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT 'vuelos'      AS tabla, COUNT(*) AS registros FROM vuelos
UNION ALL
SELECT 'pasajeros',  COUNT(*) FROM pasajeros
UNION ALL
SELECT 'reservas',   COUNT(*) FROM reservas
UNION ALL
SELECT 'tripulacion',COUNT(*) FROM tripulacion;
