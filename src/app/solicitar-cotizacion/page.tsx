import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Plank } from "@/components/plank";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";

export const metadata: Metadata = {
  title: "Solicitar cotización",
  robots: { index: false },
};

/** Paso final del carrito mientras no haya pago en línea: se envía una solicitud de cotización. */
export default async function SolicitarCotizacionPage() {
  const catalog = await getCartCatalogInfo();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <h1 className="mt-4 font-display text-2xl font-bold uppercase leading-none text-brand-blue sm:text-4xl md:text-[2.75rem]">
        Solicitar cotización
      </h1>
      <p className="mt-3 max-w-2xl text-base text-ink-muted md:text-lg">
        Revisa tus productos y déjanos tus datos: te confirmamos disponibilidad, despacho y forma de pago, sin
        compromiso.
      </p>
      <div className="mt-8">
        <CheckoutForm catalog={catalog} mode="cotizacion" />
      </div>
    </div>
  );
}
