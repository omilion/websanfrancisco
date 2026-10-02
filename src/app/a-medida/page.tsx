import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { ImageSlot } from "@/components/image-slot";
import { PageHero } from "@/components/page-hero";
import { ProcessPhotos, ProcessStepsGrid } from "@/components/process-steps";
import { SectionTitle } from "@/components/section-title";
import { ServiceIcon } from "@/components/service-icon";
import { customProjectTypes, materials } from "@/config/content";
import { landingImages, materialImages } from "@/config/images";
import { fulfillment, headquartersOf, services, whatsappUrl } from "@/config/site";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Muebles a medida",
  description:
    "Cocinas, closets y muebles a medida fabricados en Ancud. Diseñamos contigo, fabricamos en nuestro taller e instalamos en toda la isla de Chiloé.",
};

export default async function AMedidaPage() {
  const { project, stores } = await getSiteContent();
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
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark"
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
            <li key={type.slug}>
              <Link
                href={`/cotizar?tipo=${type.slug}`}
                className="group flex h-full flex-col rounded-lg bg-white p-6 ring-1 ring-sand transition hover:ring-brand-blue"
              >
                <h3 className="font-display text-2xl font-bold uppercase text-brand-blue">{type.name}</h3>
                <p className="mt-2 text-ink-muted">{type.text}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-blue">
                  Cotizar {type.name.toLowerCase()}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Proceso (pasos editables en el ERP) ──────────── */}
      <section className="bg-brand-blue" aria-labelledby="proceso">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <SectionTitle
            id="proceso"
            eyebrow="Cómo trabajamos"
            title="Tus muebles y proyectos a medida, paso a paso"
            tone="dark"
          />
          <div className="mt-10">
            <ProcessStepsGrid steps={project.steps} />
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-xl bg-brand-navy/40 p-6 ring-1 ring-white/10 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="font-display text-2xl font-bold uppercase leading-tight text-cream md:text-3xl">
              ¿Listo para empezar? Cuéntanos tu idea ahora mismo.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/cotizar"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-semibold text-brand-blue transition-colors hover:bg-cream"
              >
                Cotizar sin costo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={whatsappUrl(headquartersOf(stores).whatsapp, "Hola, quiero contarles mi idea para un mueble a medida.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle className="size-5" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-12">
            <ProcessPhotos tone="dark" />
          </div>
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
