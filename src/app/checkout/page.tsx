import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Plank } from "@/components/plank";
import { checkoutPath, commerce } from "@/config/site";
import { getLiveCartCatalogInfo } from "@/lib/cart/catalog-info";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export default function CheckoutPage() {
  // Sin pago en línea, el carrito termina en la solicitud de cotización.
  if (!commerce.onlinePayments) redirect(checkoutPath);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-4xl md:text-[2.75rem] uppercase leading-none text-brand-blue">
        Finalizar compra
      </h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-sand/50" aria-busy />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}

/** El stock y el precio se leen del ERP en cada visita: lo que se cobra tiene que ser lo vigente. */
async function CheckoutContent() {
  await connection();
  const catalog = await getLiveCartCatalogInfo();
  return <CheckoutForm catalog={catalog} />;
}
