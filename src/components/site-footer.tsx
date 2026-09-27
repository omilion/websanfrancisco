import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  ArrowUp,
  ArrowUpRight,
  ClipboardList,
  Hammer,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { fulfillment, formatPhone, site, stores, whatsappUrl } from "@/config/site";
import { getCategories } from "@/lib/catalog";
import { Plank } from "./plank";

const promises = [
  { icon: Hammer, title: "Fabricado en Ancud", text: "Taller propio en el corazón de Chiloé" },
  { icon: Truck, title: "Despacho en toda la isla", text: fulfillment.shippingArea },
  { icon: ShieldCheck, title: "Pago seguro", text: "Webpay: débito, crédito y prepago" },
  { icon: ClipboardList, title: "Cotización sin costo", text: "Proyectos a tu medida" },
];

const helpLinks = [
  { href: "/a-medida", label: "Muebles a medida" },
  { href: "/cotizar", label: "Cotizar un proyecto" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/carrito", label: "Mi carrito" },
];

const paymentMethods = ["Webpay", "Débito", "Crédito", "Prepago"];

export async function SiteFooter() {
  const categories = await getCategories();

  return (
    <footer className="mt-auto">
      {/* ── Promesas de marca ──────────────────────────────── */}
      <section aria-label="Por qué comprar en San Francisco" className="border-t border-sand bg-sand/50">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-orange-dark ring-1 ring-sand">
                <Icon className="size-6" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block font-display text-lg font-bold uppercase leading-tight text-brand-blue">
                  {title}
                </span>
                <span className="block text-sm text-ink-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Cuerpo principal ───────────────────────────────── */}
      <div className="relative isolate overflow-hidden bg-brand-navy text-cream/75">
        {/* Marca de agua gigante */}
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] -z-10 select-none whitespace-nowrap text-center font-display text-[19vw] font-bold uppercase leading-none text-white/[0.035]"
        >
          San Francisco
        </p>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-8">
          {/* Marca */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label="San Francisco Muebles, inicio" className="inline-block">
              <Image
                src="/brand/logo-horizontal-light.png"
                alt="San Francisco Muebles"
                width={1319}
                height={606}
                className="h-16 w-auto"
              />
            </Link>
            <Plank className="mt-8" />
            <p className="mt-4 max-w-sm font-display text-3xl font-bold uppercase leading-[1.05] text-cream">
              Precisión artesanal desde el corazón de Chiloé
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Muebles de stock y proyectos a medida fabricados en nuestro taller de Ancud, con maderas nobles
              del sur y cuatro tiendas en la isla.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cotizar"
                className="rounded-md bg-brand-orange px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-[#f7a33f]"
              >
                Cotizar gratis
              </Link>
              <a
                href={whatsappUrl(stores[0].phone, "Hola, les escribo desde la página web.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/60 hover:bg-white/5"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            {/* Tienda */}
            <nav aria-labelledby="footer-tienda">
              <FooterHeading id="footer-tienda">Tienda</FooterHeading>
              <ul className="mt-4 space-y-0.5 text-sm">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <FooterLink href={`/categoria/${c.slug}`}>{c.name}</FooterLink>
                  </li>
                ))}
                <li className="pt-1">
                  <Link
                    href="/productos"
                    className="inline-flex items-center gap-1 py-2 font-semibold text-cream hover:text-brand-orange"
                  >
                    Ver todo el catálogo <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Ayuda */}
            <nav aria-labelledby="footer-ayuda">
              <FooterHeading id="footer-ayuda">Te ayudamos</FooterHeading>
              <ul className="mt-4 space-y-0.5 text-sm">
                {helpLinks.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Tiendas */}
          <div className="lg:col-span-4">
            <FooterHeading id="footer-tiendas">Nuestras tiendas</FooterHeading>
            <ul className="mt-5 grid grid-cols-2 gap-3" aria-labelledby="footer-tiendas">
              {stores.map((store) => (
                <li key={store.slug} className="rounded-lg bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-display text-xl font-bold uppercase leading-none text-cream">
                      {store.city}
                    </span>
                    <a
                      href={whatsappUrl(store.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp tienda ${store.city}`}
                      className="-m-2 rounded-full p-2 text-cream/60 transition-colors hover:text-brand-orange"
                    >
                      <MessageCircle className="size-4" aria-hidden />
                    </a>
                  </div>
                  {store.isHeadquarters && (
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-brand-orange">
                      Casa matriz
                    </span>
                  )}
                  <a
                    href={`tel:${store.phone}`}
                    className="mt-1 block py-1.5 text-sm tabular-nums transition-colors hover:text-cream"
                  >
                    {formatPhone(store.phone)}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="mt-5 space-y-2 text-sm">
              {stores
                .filter((s) => s.isHeadquarters && s.address)
                .map((s) => (
                  <li key={s.slug} className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden />
                    {s.address}
                  </li>
                ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex gap-2 py-1.5 transition-colors hover:text-cream"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden />
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Barra inferior ─────────────────────────────── */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 text-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p>
                © <CurrentYear /> San Francisco Muebles · Ancud, Chiloé
              </p>
              <ul className="flex flex-wrap items-center gap-1.5" aria-label="Medios de pago">
                {paymentMethods.map((m) => (
                  <li
                    key={m}
                    className="rounded border border-white/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-cream/70"
                  >
                    {m}
                  </li>
                ))}
                <li className="pl-1 text-cream/50">Precios con IVA incluido</li>
              </ul>
            </div>

            <div className="flex items-center justify-between gap-6">
              <p>
                Página high performance desarrollada por{" "}
                <a
                  href="https://hazlomejor.cl"
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-0.5 py-1.5 font-bold text-cream underline decoration-brand-orange decoration-2 underline-offset-4 transition-colors hover:text-brand-orange"
                >
                  Hazlo Mejor
                  <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>
              </p>
              <a
                href="#"
                aria-label="Volver arriba"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-brand-orange hover:text-brand-orange"
              >
                <ArrowUp className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">
      {children}
    </h2>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-block py-2 transition-colors hover:text-cream">
      {children}
    </Link>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
