export const CATEGORIAS_DOCUMENTO = [
  { slug: 'identidad', nombre: 'Identidad' },
  { slug: 'vivienda', nombre: 'Vivienda' },
  { slug: 'salud', nombre: 'Salud' },
  { slug: 'vehiculos', nombre: 'Vehículos' },
  { slug: 'trabajo', nombre: 'Trabajo' },
  { slug: 'finanzas', nombre: 'Finanzas' },
];

export const SLUGS_CATEGORIAS = CATEGORIAS_DOCUMENTO.map((c) => c.slug);

export const ZONA_HORARIA_DEFECTO = 'America/Mexico_City';

export const TIPOS_DOCUMENTO_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];