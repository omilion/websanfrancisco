// Datos de contacto de las tiendas. Fuente: historia destacada "Contactanos" de Instagram
// (sep. 2026). Direcciones y horarios de Castro, Quellón y Quemchi pendientes de confirmar.

export interface Store {
  slug: string;
  name: string;
  city: string;
  /** Formato E.164, sin espacios: sirve para tel: y WhatsApp. */
  phone: string;
  address: string | null;
  isHeadquarters: boolean;
}

export const stores: Store[] = [
  {
    slug: "ancud",
    name: "Tienda Ancud",
    city: "Ancud",
    phone: "+56982735261",
    address: "Arturo Prat 130, esquina Baquedano, Ancud",
    isHeadquarters: true,
  },
  {
    slug: "castro",
    name: "Tienda Castro",
    city: "Castro",
    phone: "+56956901262",
    address: null,
    isHeadquarters: false,
  },
  {
    slug: "quellon",
    name: "Tienda Quellón",
    city: "Quellón",
    phone: "+56940975021",
    address: null,
    isHeadquarters: false,
  },
  {
    slug: "quemchi",
    name: "Tienda Quemchi",
    city: "Quemchi",
    phone: "+56956233768",
    address: null,
    isHeadquarters: false,
  },
];

export const site = {
  name: "San Francisco Muebles",
  email: "contacto@sanfranciscomuebles.cl",
  instagram: null as string | null, // confirmar usuario exacto (empieza con "muebleriasanfrancisco")
};

// Servicios que la marca ya comunica en redes (banner de Facebook/Instagram).
// Se usan en la franja de beneficios de la landing y en las fichas de producto.
export interface Service {
  slug: string;
  title: string;
  description: string;
  /** Aplica a productos de stock, a medida o ambos. */
  appliesTo: "stock" | "a-medida" | "ambos";
}

export const services: Service[] = [
  {
    slug: "cotizacion",
    title: "Cotizaciones sin costo",
    description: "Cuéntanos qué necesitas y te enviamos un presupuesto sin compromiso.",
    appliesTo: "a-medida",
  },
  {
    slug: "diseno",
    title: "Diseños personalizados",
    description: "Elegimos contigo madera, terminación y distribución.",
    appliesTo: "a-medida",
  },
  {
    slug: "proyectos",
    title: "Proyectos a su medida",
    description: "Cocinas, closets y muebles pensados para tu espacio exacto.",
    appliesTo: "a-medida",
  },
  {
    slug: "medicion",
    title: "Medición a domicilio",
    description: "Vamos a tu casa a tomar las medidas.",
    appliesTo: "a-medida",
  },
  {
    slug: "despacho",
    title: "Despacho a domicilio",
    description: "Llevamos tu mueble a cualquier punto de la isla de Chiloé.",
    appliesTo: "ambos",
  },
  {
    slug: "instalacion",
    title: "Armado e instalación",
    description: "Lo dejamos armado y listo para usar. Se cotiza según proyecto.",
    appliesTo: "ambos",
  },
];

// Reglas de entrega (confirmadas por el cliente, sep. 2026).
export const fulfillment = {
  /** Cobertura de despacho a domicilio. */
  shippingArea: "Isla Grande de Chiloé",
  /** Despacho y armado se cotizan según proyecto y distancia: no se cobran en Webpay,
   *  el cliente los solicita en el checkout y la tienda lo contacta. */
  shippingPricedOnRequest: true,
  assemblyPricedOnRequest: true,
  /** Retiro en tienda disponible (costo: no definido, se asume sin costo hasta confirmar). */
  storePickup: true,
  /** Condiciones de la medición a domicilio: pendiente de definir con el cliente. */
  measurementTerms: null as string | null,
};

/** Comunas de la Isla Grande de Chiloé con despacho a domicilio. */
export const shippingCommunes = ["Ancud", "Castro", "Chonchi", "Dalcahue", "Queilén", "Quellón", "Quemchi"];

/** "+56982735261" → "+56 9 8273 5261" */
export function formatPhone(phone: string): string {
  const m = phone.match(/^\+56(9)(\d{4})(\d{4})$/);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : phone;
}

export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
