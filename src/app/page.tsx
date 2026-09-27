import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ImageSlot } from "@/components/image-slot";
import { Plank } from "@/components/plank";
import { ProcessStepsGrid } from "@/components/process-steps";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { ServiceIcon } from "@/components/service-icon";
import { StoreCard } from "@/components/store-card";
import { categoryImages, heroSlides, homeCustomImage } from "@/config/images";
import { fulfillment, services, site, stores, whatsappUrl } from "@/config/site";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function Home() {
  const [categories, stockProducts] = await Promise.all([
    getCategories(),
    getProducts({ saleMode: "stock" }),
  ]);
  const featured = [...stockProducts].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0)).slice(0, 8);

  // Datos estructurados para Google: mueblería con sus sucursales, año de fundación y redes.
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: site.name,
    foundingDate: String(site.since),
    email: site.email,
    telephone: stores[0].phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Arturo Prat 130",
      addressLocality: "Ancud",
      addressRegion: "Los Lagos",
      addressCountry: "CL",
    },
    areaServed: fulfillment.shippingArea,
    sameAs: [site.social.instagram.url, site.social.facebook.url],
    department: stores
      .filter((s) => !s.isHeadquarters)
      .map((s) => ({
        "@type": "FurnitureStore",
        name: s.name,
        telephone: s.phone,
        address: { "@type": "PostalAddress", addressLocality: s.city, addressCountry: "CL" },
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
        <HeroCarousel slides={heroSlides} />
        {/* Degradado suave: deja ver la foto y mantiene legible el texto */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream/90 via-cream/60 via-45% to-cream/5 md:bg-gradient-to-r md:from-cream/85 md:via-cream/45 md:via-35% md:to-transparent md:to-65%" />

        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-start px-4 pb-16 pt-12 md:min-h-[640px] md:justify-center md:py-24">
          <div className="max-w-xl">
            <Plank className="w-16" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-orange-dark">
              Desde {site.since} · Precisión artesanal en Ancud
            </p>
            <h1
              id="hero-title"
              className="mt-2 font-display text-5xl font-bold uppercase leading-[0.95] text-brand-blue sm:text-6xl lg:text-7xl"
            >
              Muebles de madera hechos en Chiloé
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink">
              Comedores, dormitorios, sofás, closets y cocinas: en stock listos para despacho o fabricados a
              tu medida en nuestro taller. Despacho en toda la isla.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Ver catálogo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/cotizar"
                className="inline-flex items-center justify-center rounded-md border-2 border-brand-blue bg-white/70 px-6 py-3 font-semibold text-brand-blue transition-colors hover:bg-white"
              >
                Cotizar a medida
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Servicios ────────────────────────────────────── */}
      <section className="bg-brand-blue text-white" aria-label="Nuestros servicios">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((service) => (
            <li key={service.slug} className="flex flex-col items-start gap-2 lg:items-center lg:text-center">
              <ServiceIcon slug={service.slug} className="size-7 text-brand-orange" />
              <span className="font-display text-lg font-semibold uppercase leading-tight tracking-wide">
                {service.title}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Categorías ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20 lg:py-16" aria-labelledby="categorias-title">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle id="categorias-title" eyebrow="Explora" title="Muebles para cada espacio" />
          <Link
            href="/productos"
            className="hidden shrink-0 items-center gap-1 font-semibold text-brand-blue hover:underline sm:inline-flex"
          >
            Ver todo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:mt-8 lg:grid-cols-6 lg:gap-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categoria/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg lg:aspect-[3/4]"
              >
                <ImageSlot
                  src={categoryImages[category.slug] ?? null}
                  alt={category.name}
                  pending={`cat-${category.slug === "sofas" ? "living" : category.slug}.jpg`}
                  sizes="(min-width: 1024px) 17vw, (min-width: 768px) 33vw, 50vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-16 md:p-6 md:pt-24 lg:p-4 lg:pt-16">
                  <span className="font-display text-2xl font-bold uppercase text-white md:text-3xl lg:text-2xl">
                    {category.name}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Destacados (stock) ───────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-sand/50" aria-labelledby="destacados-title">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
            <SectionTitle id="destacados-title" eyebrow="Listos para despacho" title="Muebles en stock" />
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {featured.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            {/* Banner de categoría: Sofás y sillones (versión recortada en celular para que el texto se lea) */}
            <Link
              href="/categoria/sofas"
              aria-label="Sofás y sillones: ver categoría"
              className="group mt-12 block overflow-hidden rounded-xl ring-1 ring-sand md:mt-16"
            >
              <Image
                src="/images/banners/sofas-desktop.jpg"
                alt="Sofás y sillones San Francisco Muebles: diseños que combinan comodidad, estilo y fabricación a medida"
                width={2172}
                height={724}
                sizes="(min-width: 1280px) 1248px, 100vw"
                className="hidden h-auto w-full transition-transform duration-700 group-hover:scale-[1.015] md:block"
              />
              <Image
                src="/images/banners/sofas-movil.jpg"
                alt="Sofás y sillones San Francisco Muebles: diseños que combinan comodidad, estilo y fabricación a medida"
                width={1150}
                height={724}
                sizes="100vw"
                className="h-auto w-full md:hidden"
              />
            </Link>
          </div>
        </section>
      )}

      {/* ── A medida ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="a-medida-title">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg sm:mx-auto sm:w-full sm:max-w-md lg:max-w-none">
            <Image
              src={homeCustomImage.src}
              alt={homeCustomImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, (min-width: 640px) 448px, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionTitle
              id="a-medida-title"
              eyebrow="Hecho a medida"
              title="Lo hacemos para tu espacio exacto"
            />
            <p className="mt-5 text-lg text-ink-muted">
              Cocinas, closets, bibliotecas o ese rincón difícil bajo la escalera. Diseñamos y fabricamos
              contigo, con maderas nobles y terminaciones a tu gusto.
            </p>
            <div className="mt-8">
              <ProcessStepsGrid tone="light" compact />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cotizar"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Cotizar sin costo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={whatsappUrl(stores[0].phone, "Hola, quiero cotizar un mueble a medida.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-brand-blue px-6 py-3 font-semibold text-brand-blue transition-colors hover:bg-white"
              >
                <MessageCircle className="size-5" aria-hidden />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ── Tiendas ──────────────────────────────────────── */}
      <section className="bg-brand-blue text-white" aria-labelledby="tiendas-title">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <Plank />
          <h2
            id="tiendas-title"
            className="mt-4 font-display text-4xl font-bold uppercase leading-none md:text-5xl"
          >
            Cuatro tiendas en Chiloé
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Visítanos para ver y tocar las maderas.
            {fulfillment.storePickup && " Compra online y retira en la tienda que te acomode."}
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((store) => (
              <li key={store.slug}>
                <StoreCard store={store} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
