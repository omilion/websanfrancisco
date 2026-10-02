import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck, Truck } from "lucide-react";
import { categoryImages, landingImages } from "@/config/images";
import { commerce, fulfillment, formatPhone, whatsappUrl } from "@/config/site";
import { getCartCatalogInfo } from "@/lib/cart/catalog-info";
import { getCatalog } from "@/lib/catalog";
import { getStores } from "@/lib/site-content";
import { CartButton } from "./cart/cart-button";
import { MegaMenu, type MenuCategory } from "./header/mega-menu";
import { MobileMenu } from "./header/mobile-menu";
import { MobileSearch } from "./header/mobile-search";
import { SearchBox } from "./header/search-box";
import { isAvailable } from "@/lib/catalog/availability";

export async function SiteHeader() {
  const [{ categories, products }, cartCatalog, stores] = await Promise.all([
    getCatalog(),
    getCartCatalogInfo(),
    getStores(),
  ]);
  const menuCategories: MenuCategory[] = categories.map((c) => {
    const inCategory = products.filter((p) => p.categorySlug === c.slug);
    return {
      slug: c.slug,
      name: c.name,
      image: categoryImages[c.slug] ?? null,
      count: inCategory.length,
      inStock: inCategory.filter(isAvailable).length,
      subcategories: c.subcategories,
    };
  });
  const searchCategories = categories.map(({ slug, name }) => ({ slug, name }));
  const mobileStores = stores.map((s) => ({
    slug: s.slug,
    city: s.city,
    phone: s.phone,
    phoneLabel: formatPhone(s.phone),
    whatsapp: whatsappUrl(s.whatsapp, "Hola, les escribo desde la página web."),
  }));

  return (
    <>
      {/* ── 1. Barra de anuncios ─────────────────────────── */}
      <div className="bg-brand-navy text-cream/85">
        <ul className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-10 px-4 text-xs">
          <li className="flex items-center gap-2">
            <Truck className="size-3.5 text-brand-orange" aria-hidden />
            Despacho en toda la {fulfillment.shippingArea}
          </li>
          {commerce.onlinePayments && (
            <li className="hidden items-center gap-2 md:flex">
              <ShieldCheck className="size-3.5 text-brand-orange" aria-hidden />
              Pago seguro con Webpay
            </li>
          )}
          <li className="hidden items-center gap-2 lg:flex">
            <span className="font-bold text-brand-orange">✦</span>
            Cotización sin costo en proyectos a medida
          </li>
        </ul>
      </div>

      {/* ── 2. Barra principal: logo, menú, buscador, acciones ── */}
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:h-[72px] md:gap-6">
          <MobileMenu categories={menuCategories} stores={mobileStores} />

          <Link href="/" className="shrink-0" aria-label="San Francisco Muebles, inicio">
            <Image
              src="/brand/logo-nav.png"
              alt="San Francisco Muebles"
              width={1200}
              height={263}
              priority
              className="h-8 w-auto md:h-10"
            />
          </Link>

          <div className="hidden h-full lg:block">
            {/* Suspense: el menú lee la ruta actual (usePathname), que en páginas dinámicas llega al pedir la página. */}
            <Suspense fallback={null}>
              <MegaMenu categories={menuCategories} customImage={landingImages.aMedida.desktop} />
            </Suspense>
          </div>

          <div className="ml-auto hidden min-w-0 flex-1 md:block lg:max-w-xs xl:max-w-sm">
            <SearchBox categories={searchCategories} />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <MobileSearch categories={searchCategories} />
            <Link
              href="/cotizar"
              className="hidden whitespace-nowrap rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark xl:inline-block"
            >
              Cotizar gratis
            </Link>
            <CartButton catalog={cartCatalog} />
          </div>
        </div>
      </header>
    </>
  );
}
