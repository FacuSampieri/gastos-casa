export type TipoGasto = 'fijo' | 'variable';
export type MedioPago = 'credito' | 'debito' | 'efectivo';

export interface Categoria {
  id: number;
  nombre: string;
  tipo: TipoGasto;
  color: string;
  icono: string;
}

export interface Gasto {
  id: number;
  categoria_id: number;
  categoria_nombre?: string;
  categoria_tipo?: TipoGasto;
  categoria_color?: string;
  descripcion: string;
  monto: number;
  fecha: string;
  mes: number;
  anio: number;
  medio_pago: MedioPago;
  mes_impacto: number;
  anio_impacto: number;
  cuota_actual: number | null;
  cuota_total: number | null;
  cuota_grupo: string | null;
}

export interface Ingreso {
  id: number;
  monto: number;
  descripcion: string;
  mes: number;
  anio: number;
}

export interface ResumenMes {
  ingreso: number;
  total_gastos: number;
  gastos_fijos: number;
  gastos_variables: number;
  balance: number;
}

export interface Config {
  dia_cierre_tarjeta: number;
}
