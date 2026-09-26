// Formato PROVISORIO de la respuesta del ERP. Cuando Seba entregue los campos
// reales, se ajusta este archivo y mapper.ts; nada más debería cambiar.

export interface ErpProduct {
  id: string | number;
  sku: string;
  nombre: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number | null;
  stock: number | null;
  /** Stock por sucursal. Si el ERP no lo entrega, se usa `stock` como total. */
  stock_sucursales?: { sucursal: string; stock: number }[] | null;
  /** Marca del ERP que separa productos de stock y a medida. */
  tipo_venta: "stock" | "a_medida";
  categoria: string;
  subcategoria: string | null;
  /** Centímetros */
  ancho: number | null;
  alto: number | null;
  profundidad: number | null;
  imagenes: string[] | null;
  activo: boolean;
}

/** Respuesta paginada. Si el ERP no pagina, basta con devolver `data`. */
export interface ErpPage<T> {
  data: T[];
  page?: number;
  total_pages?: number;
}

export interface ErpOrderLine {
  sku: string;
  cantidad: number;
  precio_unitario: number;
}

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
