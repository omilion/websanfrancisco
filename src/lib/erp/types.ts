// Formato del endpoint de e-commerce del ERP de San Francisco (Seba, sep. 2026):
// GET /api/ecommerce/productos con header X-API-Key → { total, productos: ErpProduct[] }.
// Si cambia el formato, se ajusta este archivo y mapper.ts; nada más debería cambiar.

export interface ErpRef {
  codigo: string;
  nombre: string;
}

export interface ErpProduct {
  codigo: string;
  codigoBarra: string | null;
  /** URL absoluta de la foto principal. */
  foto: string | null;
  galeria: string[];
  nombre: string;
  /** Nombre para la web (si el ERP lo distingue del nombre interno). */
  nombreWeb: string | null;
  descripcion: string | null;
  comentarios: string | null;
  adicional: string | null;
  precios: {
    compra: number;
    /** Precio de venta normal (IVA incluido). Es el que se publica mientras `web` venga en 0. */
    venta1Normal: number;
    venta2Normal: number;
    venta1Contado: number;
    venta2Contado: number;
    venta1Efectivo: number;
    venta2Efectivo: number;
    /** Precio específico para la web; si viene > 0 tiene prioridad. */
    web: number;
  };
  iva: number;
  stockCritico: number;
  diasEntrega: number;
  activo: boolean;
  /** Marca del ERP: el producto se publica en la tienda online. */
  web: boolean;
  recomendado: boolean;
  ofertas: boolean;
  nuevosProductos: boolean;
  /** Subcategoría (ej. "SECCIONAL CIRCULAR"). */
  familia: ErpRef | null;
  /** Categoría (ej. "SOFAS SECCIONALES"). */
  grupo: ErpRef | null;
  proveedor: ErpRef | null;
  stock: {
    total: number;
    /** Bodegas: "BODEGA ANCUD", "BODEGA CASTRO", … y "INTERNET" para el stock reservado a la web. */
    porBodega: { bodega: string; codigoBodega: string; cantidad: number }[];
  };
  actualizadoEn: string;
}

export interface ErpProductsResponse {
  total: number;
  productos: ErpProduct[];
}

export interface ErpOrderLine {
  sku: string;
  nombre?: string;
  cantidad: number;
  precio_unitario: number;
}

/** Pedido pagado con Webpay que la tienda registra en el ERP (POST /api/ecommerce/pedidos). */
export interface ErpOrder {
  /** buyOrder de Webpay: sirve para cruzar el pago con el pedido y evita registrarlo dos veces. */
  orden_compra: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    rut?: string;
    direccion?: string;
    comuna?: string;
  };
  entrega: { tipo: "despacho" | "retiro"; tienda?: string; referencia?: string };
  lineas: ErpOrderLine[];
  total: number;
  armado: boolean;
  comentarios?: string;
  pago: {
    medio: "webpay";
    codigo_autorizacion: string;
    tarjeta_ultimos_digitos?: string;
    tipo_pago?: string;
    cuotas?: number;
    codigo_respuesta?: number;
    fecha: string;
  };
}

/** Respuesta del ERP al registrar un pedido. */
export interface ErpOrderResult {
  id: number;
  numero: string;
  orden_compra: string;
  duplicado: boolean;
}

/** Cotización que la tienda envía al ERP (POST /api/ecommerce/cotizaciones, multipart). */
export interface ErpQuote {
  referencia: string;
  codigo: string;
  tipo: "PERSONALIZADA" | "A_MEDIDA";
  titulo: string;
  tienda: string;
  cliente: { nombre: string; telefono: string; email?: string; comuna?: string; rut?: string; direccion?: string };
  producto?: { sku: string; nombre: string; precio: number | null };
  descripcion?: string;
  detalle: {
    medidas?: Record<string, number>;
    campos?: { label: string; value: string }[];
    material?: string;
    terminacion?: string;
    plazo?: string;
  };
}

/** GET /api/ecommerce/sitio: contenido editable de la tienda (módulo Sitio web del ERP). */
export interface ErpSiteSlide {
  id: number;
  imagenEscritorioUrl: string;
  imagenCelularUrl: string | null;
  alt: string;
  conTexto: boolean;
  alineacion: "izquierda" | "centro" | "derecha";
  pretitulo: string | null;
  titulo: string | null;
  texto: string | null;
  botonTexto: string | null;
  botonLink: string | null;
}

export interface ErpSiteBanner {
  imagenEscritorioUrl: string;
  imagenCelularUrl: string | null;
  alt: string;
  link: string;
}

export interface ErpSiteProject {
  imagenUrl: string | null;
  alt: string;
  pretitulo: string;
  titulo: string;
  texto: string;
  pasos: { titulo: string; texto: string; icono: string }[];
}

export interface ErpSiteStore {
  codigo: string;
  nombre: string;
  direccion: string | null;
  comuna: string | null;
  telefono: string | null;
  whatsapp: string | null;
  horario: string | null;
  casaCentral: boolean;
  orden: number;
  foto: string | null;
}

export interface ErpSiteContent {
  slides: ErpSiteSlide[];
  banner: ErpSiteBanner | null;
  proyecto: ErpSiteProject | null;
  sucursales: ErpSiteStore[];
}
