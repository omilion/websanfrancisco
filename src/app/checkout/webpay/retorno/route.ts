import { registerOrderInErp } from "@/lib/orders/process";
import { readOrder, saveOrder, type StoredOrder } from "@/lib/orders/storage";
import { commitTransaction, getTransactionStatus, refundTransaction, type WebpayTransaction } from "@/lib/webpay/client";

// Webpay devuelve al cliente a esta URL (por POST, a veces por GET) con:
//   token_ws                         → el cliente pagó o intentó pagar: hay que confirmar la transacción
//   TBK_TOKEN + TBK_ORDEN_COMPRA     → el cliente anuló el pago en Webpay
//   TBK_ID_SESION + TBK_ORDEN_COMPRA → se agotó el tiempo en el formulario de pago

function publicOrigin(request: Request): string {
  return process.env.SITE_URL?.trim().replace(/\/+$/, "") || new URL(request.url).origin;
}

function resultRedirect(request: Request, order: Pick<StoredOrder, "buyOrder" | "accessKey"> | null) {
  const url = new URL("/checkout/resultado", publicOrigin(request));
  if (order) {
    url.searchParams.set("orden", order.buyOrder);
    url.searchParams.set("k", order.accessKey);
  } else {
    url.searchParams.set("error", "1");
  }
  // 303: el navegador pasa de POST a GET y el refresco de la página no reenvía nada.
  return Response.redirect(url, 303);
}

async function confirm(token: string): Promise<WebpayTransaction> {
  try {
    return await commitTransaction(token);
  } catch (commitError) {
    // Refresco o doble clic: la transacción ya se confirmó; se consulta su estado en vez de volver a confirmarla.
    try {
      return await getTransactionStatus(token);
    } catch {
      throw commitError;
    }
  }
}

async function handle(request: Request, params: URLSearchParams) {
  const token = params.get("token_ws");
  const cancelled = params.get("TBK_ORDEN_COMPRA");

  if (!token) {
    const order = cancelled ? await readOrder(cancelled) : null;
    if (order && order.status === "iniciado") {
      await saveOrder({ ...order, status: "abandonado", note: params.get("TBK_TOKEN") ? "El cliente anuló el pago en Webpay" : "Se agotó el tiempo en Webpay" });
    }
    return resultRedirect(request, order);
  }

  let tx: WebpayTransaction;
  try {
    tx = await confirm(token);
  } catch (e) {
    console.error("No se pudo confirmar la transacción de Webpay", e);
    return resultRedirect(request, null);
  }

  const order = await readOrder(tx.buy_order);
  const authorized = tx.status === "AUTHORIZED" && tx.response_code === 0;

  if (!order) {
    // Cobro de un pedido que esta tienda no conoce: se devuelve el dinero.
    if (authorized) await refundTransaction(token, tx.amount).catch((e) => console.error("Reembolso fallido", tx.buy_order, e));
    return resultRedirect(request, null);
  }

  if (!authorized) {
    if (order.status === "iniciado") await saveOrder({ ...order, status: "rechazado", token, note: `Webpay respondió ${tx.status} (${tx.response_code ?? "s/c"})` });
    return resultRedirect(request, order);
  }

  if (order.token !== token || tx.amount !== order.amount) {
    console.error("Monto o token no coinciden con el pedido", order.buyOrder, tx.amount, order.amount);
    await refundTransaction(token, tx.amount).catch((e) => console.error("Reembolso fallido", order.buyOrder, e));
    await saveOrder({ ...order, status: "reembolsado", note: "El monto cobrado no coincide con el pedido" });
    return resultRedirect(request, order);
  }

  let current = order;
  if (order.status === "iniciado") {
    current = {
      ...order,
      status: "pagado",
      payment: {
        authorizationCode: tx.authorization_code ?? "",
        cardLast4: (tx.card_detail?.card_number ?? "").slice(-4),
        paymentType: tx.payment_type_code ?? "",
        installments: tx.installments_number ?? 0,
        date: tx.transaction_date ?? new Date().toISOString(),
        responseCode: tx.response_code ?? 0,
      },
    };
    await saveOrder(current);
  }
  // El pago ya está hecho: si el ERP no responde, el pedido queda "pagado" y se reintenta solo.
  await registerOrderInErp(current);
  return resultRedirect(request, order);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const params = new URLSearchParams();
  form?.forEach((value, key) => {
    if (typeof value === "string") params.set(key, value);
  });
  return handle(request, params);
}

export async function GET(request: Request) {
  return handle(request, new URL(request.url).searchParams);
}
