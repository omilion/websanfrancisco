import type { ErpProduct } from "./types";

// Datos de prueba con el formato del endpoint del ERP. Solo se usan si ERP_API_URL no está definido
// (desarrollo sin acceso al ERP). Grupos y familias tomados del catálogo real.

type Stock = Partial<Record<"INTERNET" | "ANCUD" | "CASTRO" | "QUELLON" | "QUEMCHI" | "PRINCIPAL", number>>;

function producto(
  codigo: string,
  nombre: string,
  grupo: string,
  familia: string,
  precio: number,
  stock: Stock = {},
  descripcion: string | null = null,
): ErpProduct {
  const porBodega = Object.entries(stock).map(([b, cantidad], i) => ({
    bodega: b === "INTERNET" ? "INTERNET" : `BODEGA ${b}`,
    codigoBodega: String(i + 1),
    cantidad: cantidad ?? 0,
  }));
  return {
    codigo,
    codigoBarra: null,
    foto: null,
    galeria: [],
    nombre,
    nombreWeb: nombre,
    descripcion,
    comentarios: null,
    adicional: null,
    precios: {
      compra: 0,
      venta1Normal: precio,
      venta2Normal: 0,
      venta1Contado: 0,
      venta2Contado: 0,
      venta1Efectivo: 0,
      venta2Efectivo: 0,
      web: 0,
    },
    iva: 0.19,
    stockCritico: 1,
    diasEntrega: 0,
    activo: true,
    web: true,
    recomendado: false,
    ofertas: false,
    nuevosProductos: false,
    familia: { codigo: familia, nombre: familia },
    grupo: { codigo: grupo, nombre: grupo },
    proveedor: null,
    stock: { total: porBodega.reduce((s, b) => s + b.cantidad, 0), porBodega },
    actualizadoEn: "2026-09-28T00:00:00.000Z",
  };
}

export const mockErpProducts: ErpProduct[] = [
  producto("CL100", "CLOSET GOLDEN 2 PUERTAS 2 CAJONES AZUL", "CLOSETS", "CLOSET CLASICO", 145900, { INTERNET: 2, ANCUD: 1 }),
  producto("CL102", "CLOSET GOLDEN 3 PUERTAS 2 CAJONES NEGRO", "CLOSETS", "CLOSET CLASICO", 195900, { INTERNET: 1, CASTRO: 2 }),
  producto("CL103", "CLOSET 4 PUERTAS 2 CAJONES NEGRO", "CLOSETS", "CLOSET CLASICO", 245900, { ANCUD: 1 }),
  producto("CO79", "COMODA DOMINO BLANCA 60 X 45 X 75 LINEA PLANA 3 CAJONES", "COMODAS", "COMODA ADULTO", 68500, { INTERNET: 4, ANCUD: 2, QUELLON: 1 }),
  producto("V38", "VELADOR CHOCOLATE 60 X36 X35 1 CAJON 1 ESPACIO", "VELADORES", "VELADOR ADULTO", 38500, { INTERNET: 6, CASTRO: 3 }),
  producto("FS32", "SOFA PATAGONIA 3 CUERPOS", "SOFAS", "SILLON", 345900, { QUEMCHI: 1 }),
  producto("FS39", "SOFA TOKIO 150 CM 2 CUERPOS + 2 POUF", "SOFAS", "SILLON", 285900, { INTERNET: 1, ANCUD: 1 }),
  producto("SS104", "SOFA SECCIONAL 3 PIEZAS + 2 POUF", "SOFAS SECCIONALES", "SECCIONAL OTROS", 625900, { INTERNET: 1 }),
  producto("JL146", "LIVING FLORENCIA 2 SITIALES", "JUEGOS DE LIVING", "LIVING", 645900, { CASTRO: 1 }),
  producto("B1058", "BASE 100 X 50 2 PUERTAS PINO OREGON", "BASES", "BASE 100X50", 245900, { INTERNET: 2, ANCUD: 2 }),
  producto("C626", "COMPACTO CLASICO 75 * 50", "COMPACTOS", "COMPACTO CLASICO 75X50", 245900, { QUELLON: 1 }),
  producto("MZ27", "MARQUEZA INFANTIL 1,5 PLAZA GRAFICO PRINCESAS", "MARQUEZAS", "MARQUEZA", 195900, { INTERNET: 1 }),
];
