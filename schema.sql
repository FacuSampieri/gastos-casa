-- Ejecutar esto en Neon SQL Editor

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('fijo', 'variable')),
  color VARCHAR(20) NOT NULL DEFAULT '#C84B31',
  icono VARCHAR(10) NOT NULL DEFAULT '💰',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  descripcion VARCHAR(200) DEFAULT '',
  monto NUMERIC(12,2) NOT NULL,
  fecha DATE NOT NULL,
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingresos (
  id SERIAL PRIMARY KEY,
  monto NUMERIC(12,2) NOT NULL,
  descripcion VARCHAR(200) DEFAULT 'Ingreso mensual',
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mes, anio)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_gastos_periodo ON gastos(mes, anio);
CREATE INDEX IF NOT EXISTS idx_gastos_impacto ON gastos(mes_impacto, anio_impacto);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria_id);

-- Configuración inicial
INSERT INTO config (clave, valor) VALUES ('dia_cierre_tarjeta', '22') ON CONFLICT DO NOTHING;

-- Categorías iniciales típicas para Argentina
INSERT INTO categorias (nombre, tipo, color, icono) VALUES
  ('Alquiler / Expensas', 'fijo', '#C84B31', '🏠'),
  ('Luz / Gas / Agua', 'fijo', '#E9A800', '💡'),
  ('Internet / Teléfono', 'fijo', '#2563EB', '💻'),
  ('Cuotas / Créditos', 'fijo', '#7C3AED', '💰'),
  ('Supermercado', 'variable', '#2D6A4F', '🛒'),
  ('Transporte', 'variable', '#0891B2', '🚗'),
  ('Salud / Farmacia', 'variable', '#BE185D', '🏥'),
  ('Ropa / Calzado', 'variable', '#DB7706', '👗'),
  ('Salidas / Restaurantes', 'variable', '#4F7942', '🍽️'),
  ('Entretenimiento', 'variable', '#6366F1', '🎬'),
  ('Otros', 'variable', '#7A7469', '📦')
ON CONFLICT DO NOTHING;
'#6366F1', '🎬'),
  ('Otros', 'variable', '#7A7469', '📦')
ON CONFLICT DO NOTHING;
