import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

// Pedidos de Webpay en disco (una carpeta de datos, un JSON por pedido), igual que las cotizaciones.
// Sirven para: validar el monto al volver de Webpay, mostrar el resultado y reintentar el registro en el ERP.
// turbopackIgnore: son datos que se crean en ejecución, no archivos a empaquetar con el servidor.
const ORDERS_DIR = process.env.ORDERS_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "pedidos");

const BUY_ORDER = /^SF\d{6}[A-F0-9]{8}$/;

export type OrderStatus =
  | "iniciado" // se creó la transacción en Webpay, el cliente aún no paga
  | "pagado" // Webpay autorizó el cobro, falta registrarlo en el ERP
  | "registrado" // cobro autorizado y venta creada en el ERP
  | "rechazado" // Webpay no autorizó el pago
  | "abandonado" // el cliente anuló o se agotó el tiempo en Webpay
  | "reembolsado"; // se cobró pero el pedido no era válido: se devolvió el dinero

export interface OrderLine {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderPayment {
  authorizationCode: string;
  cardLast4: string;
  paymentType: string;
  installments: number;
  date: string;
  responseCode: number;
}

export interface StoredOrder {
  buyOrder: string;
  /** Llave secreta de la URL de resultado: evita que se pueda ver un pedido ajeno adivinando el código. */
  accessKey: string;
  sessionId: string;
  createdAt: string;
  status: OrderStatus;
  token?: string;
  amount: number;
  lines: OrderLine[];
  customer: { name: string; email: string; phone: string; rut: string; address: string; commune: string };
  delivery: { type: "despacho" | "retiro"; store: string; reference: string };
  assembly: boolean;
  comments: string;
  payment?: OrderPayment;
  erp?: { id: number; number: string; registeredAt: string };
  erpAttempts?: number;
  erpError?: string;
  note?: string;
}

export function newBuyOrder(): string {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `SF${date}${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function newAccessKey(): string {
  return randomBytes(12).toString("hex");
}

function orderFile(buyOrder: string): string {
  if (!BUY_ORDER.test(buyOrder)) throw new Error("orden inválida");
  return path.join(/*turbopackIgnore: true*/ ORDERS_DIR, `${buyOrder}.json`);
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  await mkdir(ORDERS_DIR, { recursive: true });
  const file = orderFile(order.buyOrder);
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(order, null, 2));
  await rename(tmp, file);
}

export async function readOrder(buyOrder: string): Promise<StoredOrder | null> {
  if (!BUY_ORDER.test(buyOrder)) return null;
  try {
    return JSON.parse(await readFile(orderFile(buyOrder), "utf8")) as StoredOrder;
  } catch {
    return null;
  }
}

/** Pedidos cobrados por Webpay que todavía no están en el ERP. */
export async function listUnregisteredOrders(): Promise<StoredOrder[]> {
  let files: string[];
  try {
    files = await readdir(ORDERS_DIR);
  } catch {
    return [];
  }
  const orders: StoredOrder[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const order = await readOrder(file.slice(0, -5));
    if (order?.status === "pagado") orders.push(order);
  }
  return orders;
}
