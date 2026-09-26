import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { ImageSlot } from "@/components/image-slot";
import { PageHero } from "@/components/page-hero";
import { SectionTitle } from "@/components/section-title";
import { ServiceIcon } from "@/components/service-icon";
import { customProjectTypes, materials, processSteps } from "@/config/content";
import { landingImages, materialImages, processImages } from "@/config/images";
import { fulfillment, services } from "@/config/site";

export const metadata: Metadata = {
  title: "Muebles a medida",
  description:
    "Cocinas, closets y muebles a medida fabricados en Ancud. Diseñamos contigo, fabricamos en nuestro taller e instalamos en toda la isla de Chiloé.",
};

export default function AMedidaPage() {
  return (
    <>
      <PageHero
        eyebrow="Hecho a medida"
        title="Lo hacemos para tu espacio exacto"
        description="Diseñamos y fabricamos contigo muebles que calzan justo donde los necesitas, con maderas nobles de Chiloé y terminaciones a tu gusto."
        image={{ ...landingImages.aMedida, pending: "a-medida" }}
      >
        <Link
          href="/cotizar"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark"
        >
          Cotizar sin costo
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </PageHero>

      {/* ── Qué hacemos ──────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="que-hacemos">
        <SectionTitle id="que-hacemos" eyebrow="Qué hacemos" title="Proyectos para toda la casa" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customProjectTypes.map((type) => (
            <li key={type.slug} className="rounded-lg bg-white p-6 ring-1 ring-sand">
              <h3 className="font-display text-2xl font-bold uppercase text-brand-blue">{type.name}</h3>
              <p className="mt-2 text-ink-muted">{type.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Proceso ──────────────────────────────────────── */}
      <section className="bg-sand/50" aria-labelledby="proceso">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <SectionTitle id="proceso" eyebrow="Cómo trabajamos" title="De la idea a tu casa en 4 pasos" />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <li key={step.title} className="flex flex-col overflow-hidden rounded-lg bg-white ring-1 ring-sand">
                <div className="relative aspect-[4/3]">
                  <ImageSlot
                    src={processImages[i]}
                    alt={step.title}
                    pending={step.image}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-5">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-blue font-display text-xl font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Materiales ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="materiales">
        <SectionTitle id="materiales" eyebrow="Materiales" title="Maderas nobles del sur" />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {materials.map((material) => (
            <li key={material.slug}>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <ImageSlot
                  src={materialImages[material.slug] ?? null}
                  alt={material.name}
                  pending={material.image}
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase text-brand-blue">{material.name}</h3>
              <p className="mt-1 text-ink-muted">{material.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Servicios incluidos ──────────────────────────── */}
      <section className="border-t border-sand" aria-labelledby="servicios">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <SectionTitle id="servicios" eyebrow="Te acompañamos" title="Todo el proceso con nosotros" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug} className="flex gap-4">
                <ServiceIcon slug={service.slug} className="size-8 shrink-0 text-brand-orange-dark" />
                <div>
                  <h3 className="font-semibold text-ink">{service.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{service.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-ink-muted">
            Despacho e instalación en toda la {fulfillment.shippingArea}. El costo de armado e
            instalación se cotiza según el proyecto y la distancia.
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
