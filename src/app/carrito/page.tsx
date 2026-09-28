import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Plank } from "@/components/plank";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false },
};

export default async function CarritoPage() {
  const catalog = await getCartCatalogInfo();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Plank className="w-12" />
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-4xl md:text-[2.75rem] uppercase leading-none text-brand-blue">
        Tu carrito
      </h1>
      <div className="mt-8">
        <CartView catalog={catalog} />
      </div>
    </div>
  );
}
