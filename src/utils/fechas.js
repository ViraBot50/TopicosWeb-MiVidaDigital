import { ZONA_HORARIA_DEFECTO } from './constantes.js';

// Fecha de hoy (AAAA-MM-DD) en la zona horaria del usuario.
export function hoyEnZona(zona) {
  const formatear = (z) => new Intl.DateTimeFormat('en-CA', { timeZone: z }).format(new Date());
  try {
    return formatear(zona);
  } catch {
    return formatear(ZONA_HORARIA_DEFECTO);
  }
}

export function sumarDias(iso, dias) {
  const fecha = new Date(`${iso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function estadoVencimiento(fechaVencimiento, hoy) {
  if (!fechaVencimiento) return 'sin_vencimiento';
  if (fechaVencimiento < hoy) return 'vencido';
  if (fechaVencimiento <= sumarDias(hoy, 30)) return 'por_vencer';
  return 'vigente';
}