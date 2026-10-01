import "server-only";
import { createErpOrder } from "@/lib/erp/client";
import type { ErpOrder } from "@/lib/erp/types";
import { listUnregisteredOrders, saveOrder, type StoredOrder } from "./storage";

/** Pedido en formato ERP a partir de lo guardado (el pago ya está autorizado). */
export function toErpOrder(order: StoredOrder): ErpOrder {
  const pay = order.payment;
  if (!pay) throw new Error("el pedido no tiene pago autorizado");
  return {
    orden_compra: order.buyOrder,
    cliente: {
      nombre: order.customer.name,
      email: order.customer.email,
      telefono: order.customer.phone,
      rut: order.customer.rut || undefined,
      direccion: order.customer.address || undefined,
      comuna: order.customer.commune || undefined,
    },
    entrega: {
      tipo: order.delivery.type,
      tienda: order.delivery.store || undefined,
      referencia: order.delivery.reference || undefined,
    },
    lineas: order.lines.map((l) => ({ sku: l.sku, nombre: l.name, cantidad: l.quantity, precio_unitario: l.unitPrice })),
    total: order.amount,
    armado: order.assembly,
    comentarios: order.comments || undefined,
    pago: {
      medio: "webpay",
      codigo_autorizacion: pay.authorizationCode,
      tarjeta_ultimos_digitos: pay.cardLast4 || undefined,
      tipo_pago: pay.paymentType || undefined,
      cuotas: pay.installments,
      codigo_respuesta: pay.responseCode,
      fecha: pay.date,
    },
  };
}

// Un reintento a la vez por pedido dentro de este proceso (refrescos de la página, cron y retorno simultáneos).
const inFlight = new Map<string, Promise<StoredOrder>>();

/** Registra en el ERP un pedido cobrado. Nunca lanza: deja el motivo en el pedido para reintentar. */
export function registerOrderInErp(order: StoredOrder): Promise<StoredOrder> {
  const running = inFlight.get(order.buyOrder);
  if (running) return running;
  const job = (async () => {
    if (order.status === "registrado") return order;
    const attempts = (order.erpAttempts ?? 0) + 1;
    try {
      const result = await createErpOrder(toErpOrder(order));
      const done: StoredOrder = {
        ...order,
        status: "registrado",
        erp: { id: result.id, number: result.numero, registeredAt: new Date().toISOString() },
        erpAttempts: attempts,
        erpError: undefined,
      };
      await saveOrder(done);
      return done;
    } catch (e) {
      console.error(`No se pudo registrar el pedido ${order.buyOrder} en el ERP (intento ${attempts})`, e);
      const failed: StoredOrder = { ...order, erpAttempts: attempts, erpError: e instanceof Error ? e.message.slice(0, 300) : "error" };
      await saveOrder(failed).catch(() => {});
      return failed;
    }
  })().finally(() => inFlight.delete(order.buyOrder));
  inFlight.set(order.buyOrder, job);
  return job;
}

/** Reintenta todos los pedidos cobrados que no llegaron al ERP. */
export async function retryUnregisteredOrders(): Promise<{ pending: number; registered: number }> {
  const orders = await listUnregisteredOrders();
  let registered = 0;
  for (const order of orders) {
    if ((await registerOrderInErp(order)).status === "registrado") registered++;
  }
  return { pending: orders.length, registered };
}
