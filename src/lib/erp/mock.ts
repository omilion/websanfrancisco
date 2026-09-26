import type { ErpProduct } from "./types";

// Datos de prueba con el mismo formato que el ERP, usados mientras no exista ERP_API_URL.
// Categorías tomadas del sitio actual de San Francisco Muebles.

type StockPorSucursal = Partial<Record<"Ancud" | "Castro" | "Quellón" | "Quemchi", number>>;

function producto(
  id: number,
  datos: Omit<ErpProduct, "id" | "stock" | "stock_sucursales" | "tipo_venta" | "imagenes" | "activo"> & {
    stock?: StockPorSucursal;
    aMedida?: boolean;
  },
): ErpProduct {
  const { stock = {}, aMedida = false, ...resto } = datos;
  return {
    id,
    ...resto,
    stock: null,
    stock_sucursales: Object.entries(stock).map(([sucursal, n]) => ({ sucursal, stock: n })),
    tipo_venta: aMedida ? "a_medida" : "stock",
    imagenes: [],
    activo: true,
  };
}

const sinMedidas = { ancho: null, alto: null, profundidad: null };

export const mockErpProducts: ErpProduct[] = [
  // ── Comedor ──
  producto(1, {
    sku: "COM-ENC-160",
    nombre: "Mesa de comedor Encina 160",
    descripcion_corta: "Mesa de encina maciza para 6 personas.",
    descripcion:
      "Mesa de comedor fabricada en encina maciza en nuestro taller de Ancud. Terminación en aceite natural que resalta la veta de la madera.",
    precio: 489990,
    stock: { Ancud: 2, Castro: 1 },
    categoria: "Comedor",
    subcategoria: "Mesas",
    ancho: 160,
    alto: 76,
    profundidad: 90,
  }),
  producto(2, {
    sku: "COM-ROB-200",
    nombre: "Mesa de comedor Roble 200",
    descripcion_corta: "Mesa extensa de roble para 8 personas.",
    descripcion: "Mesa de roble Chiloé para 8 personas, cubierta de 4 cm y patas torneadas.",
    precio: 689990,
    stock: { Ancud: 1 },
    categoria: "Comedor",
    subcategoria: "Mesas",
    ancho: 200,
    alto: 76,
    profundidad: 95,
  }),
  producto(3, {
    sku: "COM-SIL-ROB",
    nombre: "Silla Roble Chiloé",
    descripcion_corta: "Silla de roble con asiento tapizado.",
    descripcion: "Silla de roble con asiento tapizado en tela de alto tráfico.",
    precio: 89990,
    stock: { Ancud: 12, Castro: 8, Quellón: 4, Quemchi: 6 },
    categoria: "Comedor",
    subcategoria: "Sillas",
    ancho: 45,
    alto: 90,
    profundidad: 50,
  }),
  producto(4, {
    sku: "COM-BAN-140",
    nombre: "Banca de comedor Encina",
    descripcion_corta: "Banca maciza para mesa de comedor.",
    descripcion: "Banca de encina maciza de 140 cm, ideal para acompañar mesas de 160 cm.",
    precio: 159990,
    stock: { Castro: 2, Quemchi: 1 },
    categoria: "Comedor",
    subcategoria: "Sillas",
    ancho: 140,
    alto: 45,
    profundidad: 35,
  }),

  // ── Dormitorio ──
  producto(5, {
    sku: "DOR-CAM-2P",
    nombre: "Cama 2 plazas Castro",
    descripcion_corta: "Base de cama con respaldo de madera.",
    descripcion: "Base de cama de 2 plazas con respaldo de madera nativa y listones reforzados.",
    precio: 369990,
    stock: { Ancud: 1, Castro: 1 },
    categoria: "Dormitorio",
    subcategoria: "Camas",
    ancho: 150,
    alto: 110,
    profundidad: 200,
  }),
  producto(6, {
    sku: "DOR-CAM-1P",
    nombre: "Cama 1½ plaza Quemchi",
    descripcion_corta: "Cama de plaza y media en roble.",
    descripcion: "Cama de plaza y media en roble, con respaldo de listones verticales.",
    precio: 249990,
    stock: { Quemchi: 2, Quellón: 1 },
    categoria: "Dormitorio",
    subcategoria: "Camas",
    ancho: 105,
    alto: 100,
    profundidad: 200,
  }),
  producto(7, {
    sku: "DOR-VEL-ENC",
    nombre: "Velador Encina 2 cajones",
    descripcion_corta: "Velador con dos cajones y correderas metálicas.",
    descripcion: "Velador de encina con dos cajones, correderas metálicas y tiradores de madera.",
    precio: 119990,
    stock: { Ancud: 4, Castro: 3, Quellón: 2 },
    categoria: "Dormitorio",
    subcategoria: "Veladores",
    ancho: 50,
    alto: 55,
    profundidad: 40,
  }),
  producto(8, {
    sku: "DOR-COM-6C",
    nombre: "Cómoda 6 cajones",
    descripcion_corta: "Cómoda amplia de roble con seis cajones.",
    descripcion: "Cómoda de roble con seis cajones de gran capacidad.",
    precio: 329990,
    stock: {},
    categoria: "Dormitorio",
    subcategoria: "Cómodas",
    ancho: 120,
    alto: 85,
    profundidad: 45,
  }),

  // ── Living ──
  producto(9, {
    sku: "LIV-CEN-ENC",
    nombre: "Mesa de centro Encina",
    descripcion_corta: "Mesa de centro con repisa inferior.",
    descripcion: "Mesa de centro de encina maciza con repisa inferior para revistas y mantas.",
    precio: 179990,
    stock: { Ancud: 3, Quellón: 1 },
    categoria: "Living",
    subcategoria: "Mesas de centro",
    ancho: 110,
    alto: 45,
    profundidad: 60,
  }),
  producto(10, {
    sku: "LIV-TV-180",
    nombre: "Rack TV Roble 180",
    descripcion_corta: "Mueble de TV con puertas y cajón.",
    descripcion: "Rack de TV de roble de 180 cm con dos puertas, cajón central y pasacables.",
    precio: 299990,
    stock: { Castro: 2 },
    categoria: "Living",
    subcategoria: "Muebles de TV",
    ancho: 180,
    alto: 55,
    profundidad: 45,
  }),

  // ── Sofás ──
  producto(11, {
    sku: "SOF-3C-LIN",
    nombre: "Sofá 3 cuerpos Lino",
    descripcion_corta: "Sofá de tres cuerpos tapizado en lino.",
    descripcion: "Sofá de tres cuerpos con estructura de madera y tapiz de lino color arena.",
    precio: 649990,
    stock: {},
    categoria: "Sofás",
    subcategoria: null,
    ancho: 210,
    alto: 85,
    profundidad: 92,
  }),
  producto(12, {
    sku: "SOF-SEC-L",
    nombre: "Sofá seccional en L",
    descripcion_corta: "Seccional amplio con chaise longue.",
    descripcion: "Sofá seccional en L con chaise longue reversible, tapiz de alto tráfico.",
    precio: 899990,
    stock: { Ancud: 1 },
    categoria: "Sofás",
    subcategoria: null,
    ancho: 280,
    alto: 85,
    profundidad: 160,
  }),
  producto(13, {
    sku: "SOF-2C-CUE",
    nombre: "Sofá 2 cuerpos Cuero",
    descripcion_corta: "Sofá compacto tapizado en cuero.",
    descripcion: "Sofá de dos cuerpos tapizado en cuero, con patas de roble.",
    precio: 579990,
    stock: { Castro: 1, Quemchi: 1 },
    categoria: "Sofás",
    subcategoria: null,
    ancho: 160,
    alto: 82,
    profundidad: 88,
  }),

  // ── A medida ──
  producto(14, {
    sku: "CLO-MED",
    nombre: "Closet a medida",
    descripcion_corta: "Diseñado para tu espacio, con las medidas y terminaciones que elijas.",
    descripcion:
      "Closet fabricado a medida: definimos contigo dimensiones, distribución interior, madera y terminación.",
    precio: null,
    aMedida: true,
    categoria: "Closets",
    subcategoria: null,
    ...sinMedidas,
  }),
  producto(15, {
    sku: "COC-MED",
    nombre: "Cocina a medida",
    descripcion_corta: "Muebles de cocina base y aéreos hechos para tu cocina.",
    descripcion: "Muebles de cocina a medida: bases, aéreos y despensas. Visitamos tu casa para medir.",
    precio: null,
    aMedida: true,
    categoria: "Cocina",
    subcategoria: "Muebles base",
    ...sinMedidas,
  }),
  producto(16, {
    sku: "COC-AER-MED",
    nombre: "Muebles aéreos a medida",
    descripcion_corta: "Aéreos de cocina a la medida de tu muro.",
    descripcion: "Muebles aéreos de cocina a medida, con puertas abatibles o batientes.",
    precio: null,
    aMedida: true,
    categoria: "Cocina",
    subcategoria: "Aéreos",
    ...sinMedidas,
  }),
];
