import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CartButton } from "./cart/cart-button";

export const mainNav = [
  { href: "/productos", label: "Catálogo" },
  { href: "/a-medida", label: "A medida" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20">
        <Link href="/" className="shrink-0" aria-label="San Francisco Muebles, inicio">
          <Image
            src="/brand/logo-horizontal.png"
            alt="San Francisco Muebles"
            width={1319}
            height={606}
            priority
            className="h-10 w-auto md:h-12"
          />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8 font-display text-lg font-semibold uppercase tracking-wide text-brand-blue">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-brand-orange-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cotizar"
            className="hidden rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark sm:inline-block"
          >
            Cotizar gratis
          </Link>
          <CartButton />

          {/* Menú móvil sin JavaScript */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Abrir menú"
              className="list-none rounded-md p-2 text-brand-blue hover:bg-sand [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-6 group-open:hidden" aria-hidden />
              <X className="hidden size-6 group-open:block" aria-hidden />
            </summary>
            <nav
              aria-label="Menú móvil"
              className="fixed inset-x-0 top-16 border-b border-sand bg-cream px-4 pb-6 pt-2 shadow-lg"
            >
              <ul className="font-display text-2xl font-semibold uppercase text-brand-blue">
                {mainNav.map((item) => (
                  <li key={item.href} className="border-b border-sand">
                    <Link href={item.href} className="block py-3">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/cotizar"
                className="mt-5 block rounded-md bg-brand-blue px-4 py-3 text-center font-semibold text-white"
              >
                Cotizar gratis
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
