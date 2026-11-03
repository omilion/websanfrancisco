// Cotizador a medida: preguntas por tipo de proyecto. Lo usan el formulario (navegador)
// y la API (servidor) para validar, así ambos lados siempre piden y aceptan lo mismo.

export type QuoteFieldKind = "number" | "stepper" | "select" | "toggle";

export interface QuoteField {
  name: string;
  label: string;
  kind: QuoteFieldKind;
  unit?: string;
  hint?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface QuoteType {
  slug: string;
  name: string;
  /** Pregunta principal de medidas (ancho, alto, profundidad) en cm. */
  dimensions: ("ancho" | "alto" | "profundidad" | "largo")[];
  fields: QuoteField[];
}

// Medidas: el ERP y el taller trabajan solo en milímetros. El cliente puede escribirlas en cm o mm y se convierten.
const dim = { kind: "number" as const, unit: "mm", min: 100, max: 20000 };

export const quoteTypes: QuoteType[] = [
  {
    slug: "closet",
    name: "Closet",
    dimensions: ["ancho", "alto", "profundidad"],
    fields: [
      {
        name: "tipo_puertas",
        label: "Tipo de puertas",
        kind: "select",
        options: ["Abatibles", "Correderas", "Sin puertas (walk-in)"],
      },
      { name: "puertas", label: "Cantidad de puertas", kind: "stepper", min: 0, max: 12 },
      {
        name: "cajoneras",
        label: "Cajoneras",
        kind: "stepper",
        min: 0,
        max: 8,
        hint: "Módulos con cajones",
      },
      { name: "cajones", label: "Cajones en total", kind: "stepper", min: 0, max: 30 },
      { name: "barras", label: "Barras para colgar", kind: "stepper", min: 0, max: 6 },
      { name: "repisas", label: "Repisas", kind: "stepper", min: 0, max: 30 },
      { name: "maletero", label: "Maletero superior", kind: "toggle" },
      { name: "espejo", label: "Espejo en una puerta", kind: "toggle" },
    ],
  },
  {
    slug: "cocina",
    name: "Cocina",
    dimensions: ["largo", "alto"],
    fields: [
      {
        name: "forma",
        label: "Forma de la cocina",
        kind: "select",
        options: ["Lineal", "En L", "En U", "Paralela", "Con isla"],
      },
      { name: "muebles_aereos", label: "Muebles aéreos", kind: "toggle" },
      { name: "cajones", label: "Cajones en total", kind: "stepper", min: 0, max: 30 },
      {
        name: "cubierta",
        label: "Cubierta",
        kind: "select",
        options: ["Incluir cubierta", "Ya tengo cubierta", "Necesito asesoría"],
      },
      { name: "horno_empotrado", label: "Espacio para horno empotrado", kind: "toggle" },
      { name: "microondas_empotrado", label: "Espacio para microondas", kind: "toggle" },
      { name: "despensa", label: "Despensa o columna alta", kind: "toggle" },
    ],
  },
  {
    slug: "living",
    name: "Living y TV",
    dimensions: ["ancho", "alto", "profundidad"],
    fields: [
      {
        name: "mueble",
        label: "¿Qué mueble?",
        kind: "select",
        options: ["Mueble de TV", "Mueble de TV a muro completo", "Biblioteca", "Repisas", "Rack"],
      },
      {
        name: "tv_pulgadas",
        label: "Tamaño del televisor",
        kind: "number",
        unit: "pulgadas",
        min: 20,
        max: 120,
        hint: "Si aplica",
      },
      { name: "puertas", label: "Puertas", kind: "stepper", min: 0, max: 12 },
      { name: "cajones", label: "Cajones", kind: "stepper", min: 0, max: 12 },
      { name: "repisas", label: "Repisas abiertas", kind: "stepper", min: 0, max: 20 },
    ],
  },
  {
    slug: "dormitorio",
    name: "Dormitorio",
    dimensions: [],
    fields: [
      {
        name: "mueble",
        label: "¿Qué necesitas?",
        kind: "select",
        options: ["Juego completo", "Cama", "Respaldo", "Veladores", "Cómoda"],
      },
      {
        name: "tamano_cama",
        label: "Tamaño de cama",
        kind: "select",
        options: ["1 plaza", "1½ plaza", "2 plazas", "King", "Super King", "No aplica"],
      },
      { name: "veladores", label: "Veladores", kind: "stepper", min: 0, max: 4 },
      {
        name: "cajones",
        label: "Cajones (cómoda o veladores)",
        kind: "stepper",
        min: 0,
        max: 20,
      },
    ],
  },
  {
    slug: "comedor",
    name: "Comedor",
    dimensions: ["largo", "ancho"],
    fields: [
      {
        name: "mueble",
        label: "¿Qué necesitas?",
        kind: "select",
        options: ["Juego completo", "Mesa", "Sillas", "Banca", "Arrimo o buffet"],
      },
      { name: "personas", label: "Personas en la mesa", kind: "stepper", min: 2, max: 16 },
      { name: "sillas", label: "Sillas", kind: "stepper", min: 0, max: 16 },
    ],
  },
  {
    slug: "otro",
    name: "Proyecto especial",
    dimensions: ["ancho", "alto", "profundidad"],
    fields: [],
  },
];

export const dimensionLabels: Record<QuoteType["dimensions"][number], string> = {
  ancho: "Ancho",
  alto: "Alto",
  profundidad: "Profundidad",
  largo: "Largo",
};
export const dimensionField = dim;

export type DimensionUnit = "cm" | "mm";
export const dimensionUnits: DimensionUnit[] = ["cm", "mm"];

/** Medida escrita por el cliente (en cm o mm) → milímetros enteros dentro del rango permitido, o null si no es válida. */
export function toMillimeters(value: unknown, unit: unknown): number | null {
  const n = Number(value);
  if (value === "" || value === null || value === undefined || !Number.isFinite(n) || n <= 0) return null;
  const mm = Math.round(unit === "mm" ? n : n * 10);
  return Math.min(Math.max(mm, dim.min), dim.max);
}

export const quoteMaterials = ["Encina", "Roble Chiloé", "Necesito asesoría"];
export const quoteDeadlines = [
  "Lo antes posible",
  "En 1 a 2 meses",
  "En más de 2 meses",
  "Solo estoy cotizando",
];

/** Archivos adjuntos: fotos del espacio, planos o bocetos. */
export const attachmentRules = {
  maxFiles: 5,
  /** Por archivo, después de comprimir las fotos en el navegador. */
  maxFileBytes: 10 * 1024 * 1024,
  maxTotalBytes: 30 * 1024 * 1024,
  accept: "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf",
  label: "JPG, PNG, WEBP, HEIC o PDF",
};

export function getQuoteType(slug: string | null | undefined): QuoteType | undefined {
  return quoteTypes.find((t) => t.slug === slug);
}

/** Tipo de cotización sugerido para una categoría del catálogo. */
export function quoteTypeForCategory(categorySlug: string): string {
  const map: Record<string, string> = {
    closets: "closet",
    cocina: "cocina",
    living: "living",
    dormitorio: "dormitorio",
    comedor: "comedor",
  };
  return map[categorySlug] ?? "otro";
}

/** Solicitud tal como se guarda. */
export interface QuoteRequest {
  id: string;
  code: string;
  createdAt: string;
  type: string;
  typeName: string;
  /** Medidas en milímetros (las solicitudes anteriores a nov. 2026 no tienen `unidad` y están en cm). */
  dimensions: Record<string, number>;
  unidad?: "mm";
  details: { label: string; value: string }[];
  material: string;
  finish: string;
  description: string;
  deadline: string;
  contact: { name: string; phone: string; email: string; commune: string };
  store: string;
  attachments: { file: string; name: string; type: string; size: number }[];
  /**
   * "productos": cotización de productos del catálogo desde el carrito.
   * "personalizada": un producto del catálogo con otro color o tamaño (desde la ficha del producto).
   * Sin valor o "a-medida": proyecto a medida.
   */
  kind?: "a-medida" | "productos" | "personalizada";
  /** Producto base (solo kind "personalizada"). */
  product?: { sku: string; slug: string; name: string; price: number | null };
  /** Envío al módulo Cotizaciones del ERP: `id` si ya llegó; `error` si falló y se reintentará. */
  erp?: { id?: number; codigo?: string; syncedAt?: string; error?: string; attempts?: number };
  /** Productos cotizados (solo kind "productos"). Precios del catálogo al momento de la solicitud. */
  items?: { sku: string; name: string; quantity: number; unitPrice: number }[];
}
