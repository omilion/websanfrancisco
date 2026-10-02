// Datos de contacto de las tiendas. Se administran en el ERP (Sucursales → Tienda online) y la tienda los lee
// con getStores() en el servidor o useStores() en el navegador. `fallbackStores` es el respaldo si el ERP no
// responde (fuente: sanfranciscomuebles.cl/contacto y la historia "Contactanos" de Instagram, sep. 2026).

export interface Store {
  slug: string;
  name: string;
  city: string;
  /** Formato E.164, sin espacios: sirve para tel: y WhatsApp. */
  phone: string;
  /** Número del botón de WhatsApp (si en el ERP queda vacío, es el mismo teléfono). */
  whatsapp: string;
  /** Horario de atención, tal como se escribe en el ERP. */
  hours: string | null;
  address: string | null;
  isHeadquarters: boolean;
  /** Foto de la fachada (URL del ERP o, en el respaldo, /public/images/tiendas). */
  image: string | null;
}

/** Link de Google Maps con la dirección de la tienda. */
export function mapsUrl(store: Store): string | null {
  if (!store.address) return null;
  const query = `${store.address}, ${store.city}, Chiloé, Chile`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const fallbackStores: Store[] = [
  {
    slug: "ancud",
    name: "Tienda Ancud",
    city: "Ancud",
    phone: "+56982735261",
    whatsapp: "+56982735261",
    hours: null,
    address: "Arturo Prat 130, esquina Baquedano",
    isHeadquarters: true,
    image: "/images/tiendas/ancud.jpg",
  },
  {
    slug: "castro",
    name: "Tienda Castro",
    city: "Castro",
    phone: "+56956901262",
    whatsapp: "+56956901262",
    hours: null,
    address: "Galvarino Riveros 1663",
    isHeadquarters: false,
    image: "/images/tiendas/castro.jpg",
  },
  {
    slug: "quellon",
    name: "Tienda Quellón",
    city: "Quellón",
    phone: "+56940975021",
    whatsapp: "+56940975021",
    hours: null,
    address: "Avenida La Paz 416",
    isHeadquarters: false,
    image: "/images/tiendas/quellon.jpg",
  },
  {
    slug: "quemchi",
    name: "Tienda Quemchi",
    city: "Quemchi",
    phone: "+56956233768",
    whatsapp: "+56956233768",
    hours: null,
    address: "Pedro Montt 135, local 2",
    isHeadquarters: false,
    image: null,
  },
];

/** Tienda principal: la marcada como casa central o, si ninguna lo está, la primera. */
export function headquartersOf(stores: Store[]): Store {
  return stores.find((s) => s.isHeadquarters) ?? stores[0];
}

const NUMBER_WORDS = ["", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

/** 4 → "cuatro tiendas", 1 → "una tienda". */
export function storeCountLabel(count: number): string {
  const word = NUMBER_WORDS[count] ?? String(count);
  return `${word} ${count === 1 ? "tienda" : "tiendas"}`;
}

/** ["Ancud", "Castro", "Quellón"] → "Ancud, Castro y Quellón". */
export function cityList(stores: Store[]): string {
  const cities = stores.map((s) => s.city);
  return cities.length > 1 ? `${cities.slice(0, -1).join(", ")} y ${cities.at(-1)}` : (cities[0] ?? "");
}

export const site = {
  name: "San Francisco Muebles",
  email: "contacto@sanfranciscomuebles.cl",
  /** Año desde el que la familia está en el rubro (inicio formal: 2000, primeros muebles propios: 2002). */
  since: 1999,
  social: {
    instagram: { handle: "@muebleriasanfrancisco", url: "https://www.instagram.com/muebleriasanfrancisco/" },
    facebook: { handle: "Mueblería San Francisco", url: "https://www.facebook.com/msanfrancisco1/" },
  },
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

/**
 * Venta en línea. Con `onlinePayments: true` el carrito termina en el pago con Webpay (/checkout) y la venta
 * queda registrada en el ERP. Con `false`, los precios se muestran pero el carrito termina en una solicitud
 * de cotización (sin Webpay).
 */
export const commerce = {
  onlinePayments: true,
};

/** Paso final del carrito según el modo de venta. */
export const checkoutPath = commerce.onlinePayments ? "/checkout" : "/solicitar-cotizacion";

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
