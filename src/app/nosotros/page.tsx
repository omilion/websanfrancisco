import type { Metadata } from "next";
import { Hammer, HeartHandshake, MapPin, Trees } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { ImageSlot } from "@/components/image-slot";
import { PageHero } from "@/components/page-hero";
import { PendingText } from "@/components/pending-text";
import { SectionTitle } from "@/components/section-title";
import { StoreCard } from "@/components/store-card";
import { pageImages, woodBackground } from "@/config/images";
import { stores } from "@/config/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "San Francisco Muebles: un taller de Ancud que fabrica muebles a medida y de stock, con cuatro tiendas en Chiloé.",
};

const values = [
  {
    icon: Hammer,
    title: "Precisión artesanal",
    text: "Cada mueble se fabrica en nuestro taller de Ancud, cuidando cada unión y cada terminación.",
  },
  {
    icon: Trees,
    title: "Maderas nobles",
    text: "Trabajamos con encina y roble, maderas firmes que duran por años.",
  },
  {
    icon: HeartHandshake,
    title: "Simplicidad en cada detalle",
    text: "Diseños honestos y funcionales, pensados para la vida diaria en el sur.",
  },
  {
    icon: MapPin,
    title: "Cerca tuyo",
    text: "Cuatro tiendas en Chiloé y despacho a toda la isla.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        eyebrow="Nosotros"
        title="Un taller del corazón de Chiloé"
        description="Fabricamos muebles en Ancud para las casas de Chiloé: a medida para tu espacio y de stock para llevar."
        background={woodBackground}
      />

      {/* ── Historia ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="historia">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[5/4]">
            <ImageSlot
              src={pageImages.nosotros.desktop}
              alt={pageImages.nosotros.alt}
              pending="nosotros.jpg (foto real)"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <SectionTitle id="historia" eyebrow="Nuestra historia" title="Hechos en Ancud" />
            <p className="mt-5 text-lg text-ink-muted">
              En San Francisco Muebles diseñamos y fabricamos muebles con maderas nobles del sur.
              Desde nuestro taller en Ancud atendemos a familias de toda la isla, con cuatro tiendas en
              Ancud, Castro, Quellón y Quemchi.
            </p>
            <div className="mt-6">
              <PendingText>
                historia de la familia, año de fundación y quiénes están detrás del taller. Confirmar
                con el cliente.
              </PendingText>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ──────────────────────────────────────── */}
      <section className="bg-sand/50" aria-labelledby="valores">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <SectionTitle id="valores" eyebrow="Lo que nos mueve" title="Cómo hacemos las cosas" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg bg-white p-6 ring-1 ring-sand">
                <Icon className="size-8 text-brand-orange-dark" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-4 font-display text-2xl font-bold uppercase leading-tight text-brand-blue">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Tiendas ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="tiendas">
        <SectionTitle id="tiendas" eyebrow="Visítanos" title="Cuatro tiendas en Chiloé" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store) => (
            <li key={store.slug}>
              <StoreCard store={store} tone="light" />
            </li>
          ))}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
