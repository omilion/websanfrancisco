import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ImageSlot } from "@/components/image-slot";
import { Plank } from "@/components/plank";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { ServiceIcon } from "@/components/service-icon";
import { StoreCard } from "@/components/store-card";
import { processSteps } from "@/config/content";
import { categoryImages, landingImages, processImages } from "@/config/images";
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
        <div className="absolute inset-0 -z-10 hidden md:block">
          <ImageSlot
            src={landingImages.hero.desktop}
            alt={landingImages.hero.alt}
            pending="hero-desktop.jpg"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 -z-10 md:hidden">
          <ImageSlot
            src={landingImages.hero.mobile}
            alt={landingImages.hero.alt}
            pending="hero-movil.jpg"
            sizes="100vw"
            priority
          />
        </div>
        {/* Degradado para que el texto se lea sobre la foto */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream via-cream/85 to-transparent md:bg-gradient-to-r md:from-cream md:via-cream/80 md:via-45% md:to-transparent" />

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
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="categorias-title">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle id="categorias-title" eyebrow="Explora" title="Muebles para cada espacio" />
          <Link
            href="/productos"
            className="hidden shrink-0 items-center gap-1 font-semibold text-brand-blue hover:underline sm:inline-flex"
          >
            Ver todo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categoria/${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-lg"
              >
                <ImageSlot
                  src={categoryImages[category.slug] ?? null}
                  alt={category.name}
                  pending={`cat-${category.slug === "sofas" ? "living" : category.slug}.jpg`}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-16 md:p-6 md:pt-24">
                  <span className="font-display text-2xl font-bold uppercase text-white md:text-3xl">
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
          </div>
        </section>
      )}

      {/* ── A medida ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="a-medida-title">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[4/3] lg:aspect-[4/5]">
            <ImageSlot
              src={landingImages.aMedida.mobile}
              alt={landingImages.aMedida.alt}
              pending="a-medida-movil.jpg"
              sizes="(min-width: 1024px) 50vw, 100vw"
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
            <ol className="mt-8 space-y-5">
              {processSteps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue font-display text-xl font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="text-sm text-ink-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
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

        {/* Fotos del proceso (aparecen cuando Carla las entregue) */}
        {processImages.some(Boolean) && (
          <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {processSteps.map((step, i) => (
              <li key={step.image} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <ImageSlot src={processImages[i]} alt={step.title} pending={step.image} sizes="25vw" />
              </li>
            ))}
          </ul>
        )}
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
