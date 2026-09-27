import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { ServiceIcon } from "@/components/service-icon";
import { QuoteWizard } from "@/components/quote/quote-wizard";
import { pageImages } from "@/config/images";
import { services } from "@/config/site";

export const metadata: Metadata = {
  title: "Cotizar mueble a medida",
  description:
    "Cotiza sin costo tu mueble a medida: cocinas, closets, dormitorios y más, fabricados en Ancud. Adjunta fotos o planos de tu espacio.",
};

const quoteServices = services.filter((s) => s.appliesTo === "a-medida");

export default function CotizarPage() {
  return (
    <>
      <PageHero
        eyebrow="Cotización sin costo"
        title="Cotiza tu mueble a medida"
        description="Cuéntanos qué necesitas en 4 pasos, adjunta fotos o planos de tu espacio y te enviamos la propuesta sin compromiso."
        image={{ ...pageImages.cotizacion, pending: "cotizacion" }}
        compact
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-3 py-6 sm:px-4 md:py-24 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div className="rounded-lg bg-white p-4 ring-1 ring-sand sm:p-6 md:p-8">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-sand/40" aria-busy />}>
            <QuoteWizard />
          </Suspense>
        </div>

        <aside aria-label="Cómo te acompañamos">
          <h2 className="font-display text-2xl font-bold uppercase text-brand-blue sm:text-3xl">
            Te acompañamos
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:block sm:space-y-5">
            {quoteServices.map((service) => (
              <li key={service.slug} className="flex gap-2.5 sm:gap-4">
                <ServiceIcon
                  slug={service.slug}
                  className="size-5 shrink-0 text-brand-orange-dark sm:size-7"
                />
                <div>
                  <h3 className="text-sm font-semibold leading-tight text-ink sm:text-base">
                    {service.title}
                  </h3>
                  <p className="mt-0.5 hidden text-sm text-ink-muted sm:block">{service.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-lg bg-sand/60 p-4 text-sm text-ink-muted">
            ¿Buscas un mueble listo para llevar? Revisa nuestro{" "}
            <Link href="/productos" className="font-semibold text-brand-blue hover:underline">
              catálogo de muebles en stock
            </Link>
            .
          </p>
        </aside>
      </section>
    </>
  );
}
