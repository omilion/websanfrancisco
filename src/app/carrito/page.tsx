import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CartView } from "@/components/cart/cart-view";
import { Plank } from "@/components/plank";
import { getLiveCartCatalogInfo } from "@/lib/cart/catalog-info";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false },
};

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-4xl md:text-[2.75rem] uppercase leading-none text-brand-blue">
        Tu carrito
      </h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-sand/50" aria-busy />}>
          <CartContent />
        </Suspense>
      </div>
    </div>
  );
}

/** El stock y el precio se leen del ERP en cada visita, para que el carrito nunca muestre datos viejos. */
async function CartContent() {
  await connection();
  const catalog = await getLiveCartCatalogInfo();
  return <CartView catalog={catalog} />;
}
