import "server-only";

// Webpay Plus (API REST de Transbank, v1.2).
// WEBPAY_ENV=integration (por defecto): ambiente de certificación con las credenciales públicas de pruebas.
// WEBPAY_ENV=production: exige WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY reales del comercio.

const INTEGRATION = {
  host: "https://webpay3gint.transbank.cl",
  commerceCode: "597055555532",
  apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
};
const PRODUCTION_HOST = "https://webpay3g.transbank.cl";
const BASE_PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

export const isWebpayProduction = process.env.WEBPAY_ENV === "production";

function credentials() {
  if (!isWebpayProduction) {
    return {
      host: INTEGRATION.host,
      commerceCode: process.env.WEBPAY_COMMERCE_CODE || INTEGRATION.commerceCode,
      apiKey: process.env.WEBPAY_API_KEY || INTEGRATION.apiKey,
    };
  }
  const commerceCode = process.env.WEBPAY_COMMERCE_CODE;
  const apiKey = process.env.WEBPAY_API_KEY;
  if (!commerceCode || !apiKey) throw new Error("WEBPAY_COMMERCE_CODE y WEBPAY_API_KEY son obligatorios en producción");
  return { host: PRODUCTION_HOST, commerceCode, apiKey };
}

export type WebpayStatus = "INITIALIZED" | "AUTHORIZED" | "REVERSED" | "FAILED" | "NULLIFIED" | "PARTIALLY_NULLIFIED" | "CAPTURED";

export interface WebpayTransaction {
  vci?: string;
  amount: number;
  status: WebpayStatus;
  buy_order: string;
  session_id: string;
  card_detail?: { card_number?: string };
  accounting_date?: string;
  transaction_date?: string;
  authorization_code?: string;
  payment_type_code?: string;
  response_code?: number;
  installments_number?: number;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { host, commerceCode, apiKey } = credentials();
  const res = await fetch(`${host}${BASE_PATH}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Tbk-Api-Key-Id": commerceCode,
      "Tbk-Api-Key-Secret": apiKey,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Webpay ${method} ${path ? "/…" : ""} → ${res.status} ${text.slice(0, 200)}`);
  return JSON.parse(text) as T;
}

/** Crea la transacción; el cliente debe ir a `url` enviando `token_ws` por POST. */
export function createTransaction(input: { buyOrder: string; sessionId: string; amount: number; returnUrl: string }) {
  return call<{ token: string; url: string }>("POST", "", {
    buy_order: input.buyOrder,
    session_id: input.sessionId,
    amount: input.amount,
    return_url: input.returnUrl,
  });
}

/** Confirma la transacción (solo se puede una vez, hasta 5 minutos después de la autorización del cliente). */
export function commitTransaction(token: string) {
  return call<WebpayTransaction>("PUT", `/${encodeURIComponent(token)}`);
}

export function getTransactionStatus(token: string) {
  return call<WebpayTransaction>("GET", `/${encodeURIComponent(token)}`);
}

/** Anula o reversa un cobro autorizado (si el pedido no se puede aceptar tras el pago). */
export function refundTransaction(token: string, amount: number) {
  return call<{ type: string; response_code: number }>("POST", `/${encodeURIComponent(token)}/refunds`, { amount });
}
