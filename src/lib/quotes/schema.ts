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
  /** Valor inicial en el formulario. */
  initial?: number | string | boolean;
}

export interface QuoteType {
  slug: string;
  name: string;
  /** Pregunta principal de medidas (ancho, alto, profundidad) en cm. */
  dimensions: ("ancho" | "alto" | "profundidad" | "largo")[];
  fields: QuoteField[];
}

const dim = { kind: "number" as const, unit: "cm", min: 10, max: 2000 };

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
        initial: "Abatibles",
      },
      { name: "puertas", label: "Cantidad de puertas", kind: "stepper", min: 0, max: 12, initial: 2 },
      {
        name: "cajoneras",
        label: "Cajoneras",
        kind: "stepper",
        min: 0,
        max: 8,
        initial: 1,
        hint: "Módulos con cajones",
      },
      { name: "cajones", label: "Cajones en total", kind: "stepper", min: 0, max: 30, initial: 3 },
      { name: "barras", label: "Barras para colgar", kind: "stepper", min: 0, max: 6, initial: 1 },
      { name: "repisas", label: "Repisas", kind: "stepper", min: 0, max: 30, initial: 4 },
      { name: "maletero", label: "Maletero superior", kind: "toggle", initial: true },
      { name: "espejo", label: "Espejo en una puerta", kind: "toggle", initial: false },
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
        initial: "En L",
      },
      { name: "muebles_aereos", label: "Muebles aéreos", kind: "toggle", initial: true },
      { name: "cajones", label: "Cajones en total", kind: "stepper", min: 0, max: 30, initial: 4 },
      {
        name: "cubierta",
        label: "Cubierta",
        kind: "select",
        options: ["Incluir cubierta", "Ya tengo cubierta", "Necesito asesoría"],
        initial: "Incluir cubierta",
      },
      { name: "horno_empotrado", label: "Espacio para horno empotrado", kind: "toggle", initial: false },
      { name: "microondas_empotrado", label: "Espacio para microondas", kind: "toggle", initial: false },
      { name: "despensa", label: "Despensa o columna alta", kind: "toggle", initial: false },
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
        initial: "Mueble de TV",
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
      { name: "puertas", label: "Puertas", kind: "stepper", min: 0, max: 12, initial: 2 },
      { name: "cajones", label: "Cajones", kind: "stepper", min: 0, max: 12, initial: 1 },
      { name: "repisas", label: "Repisas abiertas", kind: "stepper", min: 0, max: 20, initial: 2 },
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
        initial: "Juego completo",
      },
      {
        name: "tamano_cama",
        label: "Tamaño de cama",
        kind: "select",
        options: ["1 plaza", "1½ plaza", "2 plazas", "King", "Super King", "No aplica"],
        initial: "2 plazas",
      },
      { name: "veladores", label: "Veladores", kind: "stepper", min: 0, max: 4, initial: 2 },
      {
        name: "cajones",
        label: "Cajones (cómoda o veladores)",
        kind: "stepper",
        min: 0,
        max: 20,
        initial: 2,
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
        initial: "Juego completo",
      },
      { name: "personas", label: "Personas en la mesa", kind: "stepper", min: 2, max: 16, initial: 6 },
      { name: "sillas", label: "Sillas", kind: "stepper", min: 0, max: 16, initial: 6 },
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
  dimensions: Record<string, number>;
  details: { label: string; value: string }[];
  material: string;
  finish: string;
  description: string;
  deadline: string;
  contact: { name: string; phone: string; email: string; commune: string };
  store: string;
  attachments: { file: string; name: string; type: string; size: number }[];
}
