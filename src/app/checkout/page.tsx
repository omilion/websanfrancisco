import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Plank } from "@/components/plank";
import { checkoutPath, commerce } from "@/config/site";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default async function CheckoutPage() {
  // Sin pago en línea, el carrito termina en la solicitud de cotización.
  if (!commerce.onlinePayments) redirect(checkoutPath);
  const catalog = await getCartCatalogInfo();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-4xl md:text-[2.75rem] uppercase leading-none text-brand-blue">
        Finalizar compra
      </h1>
      <div className="mt-8">
        <CheckoutForm catalog={catalog} />
      </div>
    </div>
  );
}
