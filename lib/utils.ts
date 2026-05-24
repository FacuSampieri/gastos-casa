export function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function mesNombre(mes: number) {
  return new Date(2024, mes - 1, 1).toLocaleString('es-AR', { month: 'long' });
}

export function mesCorto(mes: number) {
  return new Date(2024, mes - 1, 1).toLocaleString('es-AR', { month: 'short' });
}

export function getMesActual() {
  const now = new Date();
  return { mes: now.getMonth() + 1, anio: now.getFullYear() };
}

export function periodoAnterior(mes: number, anio: number) {
  if (mes === 1) return { mes: 12, anio: anio - 1 };
  return { mes: mes - 1, anio };
}

export function periodoSiguiente(mes: number, anio: number) {
  if (mes === 12) return { mes: 1, anio: anio + 1 };
  return { mes: mes + 1, anio };
}

export const COLORES = [
  '#C84B31', '#2D6A4F', '#2563EB', '#7C3AED', '#DB7706',
  '#0891B2', '#BE185D', '#4F7942', '#6366F1', '#D97706',
];

export const ICONOS = ['🏠','🛒','🚗','💡','🏥','👗','🍽️','🎬','📚','✈️','🏋️','💻','🐾','🎓','💰'];
