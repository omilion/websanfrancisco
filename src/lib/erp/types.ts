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
  cantidad: number;
  precio_unitario: number;
}

/** Pedido a registrar en el ERP (formato provisorio: falta el endpoint de Seba). */
export interface ErpOrder {
  /** buyOrder de Webpay: sirve para cruzar el pago con el pedido. */
  orden_compra: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    rut?: string;
    direccion?: string;
    comuna?: string;
  };
  lineas: ErpOrderLine[];
  total: number;
  pago: {
    medio: "webpay";
    codigo_autorizacion: string;
    tarjeta_ultimos_digitos?: string;
    fecha: string;
  };
}
