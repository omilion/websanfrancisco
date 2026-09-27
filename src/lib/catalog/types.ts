// Modelo de la tienda. Todo lo que venga del ERP se transforma a estos tipos
// en src/lib/erp/mapper.ts, así el resto de la app no depende del formato del ERP.

/** "stock": se compra con Webpay. "a-medida": se cotiza. Lo define el ERP. */
export type SaleMode = "stock" | "a-medida";

export interface Dimensions {
  /** Centímetros */
  width: number | null;
  height: number | null;
  depth: number | null;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Pesos chilenos, IVA incluido. null en productos a medida sin precio base. */
  price: number | null;
  /**
   * Stock vendible online: el de la bodega "Internet" del ERP. Es el que usan el carrito,
   * el pago y los filtros de disponibilidad.
   */
  stock: number;
  /** Stock físico por tienda (ancud, castro, quellon, quemchi). Solo referencia para retiro o consulta. */
  stockByStore: Record<string, number>;
  saleMode: SaleMode;
  categorySlug: string;
  subcategorySlug: string | null;
  dimensions: Dimensions;
  images: ProductImage[];
}

export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Catalog {
  categories: Category[];
  products: Product[];
}
