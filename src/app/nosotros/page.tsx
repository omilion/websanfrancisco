import type { Metadata } from "next";
import { Hammer, HeartHandshake, MapPin, Trees } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { SectionTitle } from "@/components/section-title";
import { SocialLinks } from "@/components/social-links";
import { StoreCard } from "@/components/store-card";
import { woodBackground } from "@/config/images";
import { site, stores } from "@/config/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "San Francisco Muebles: desde 1999 en Ancud, Chiloé. Fabricamos nuestra propia línea de muebles y proyectos a medida, con cuatro tiendas en la isla.",
};

const milestones = [
  { year: "1999", title: "Los comienzos", text: "Damos nuestros primeros pasos en el rubro del mueble en Ancud." },
  { year: "2000", title: "Inicio formal", text: "Iniciamos formalmente nuestras actividades en Ancud, Chiloé." },
  {
    year: "2002",
    title: "Nuestros primeros muebles",
    text: "Con gran dedicación fabricamos nuestros primeros muebles propios.",
  },
  {
    year: "Hoy",
    title: "Cuatro tiendas en la isla",
    text: "Línea propia de muebles, proyectos a medida y tiendas en Ancud, Castro, Quellón y Quemchi.",
  },
];

const stats = [
  { value: `Desde ${site.since}`, label: "en el rubro del mueble" },
  { value: "2002", label: "fabricando muebles propios" },
  { value: "4", label: "tiendas en Chiloé" },
];

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
    title: "Compromiso con Chiloé",
    text: "Cuatro tiendas en la isla y el mayor compromiso con nuestra comunidad.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        eyebrow={`Desde ${site.since} en Ancud`}
        title="Un taller del corazón de Chiloé"
        description="Somos una empresa chilota del rubro del hogar y los muebles: fabricamos nuestra propia línea y proyectos a medida para las casas de la isla."
        background={woodBackground}
      />

      {/* ── Historia ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="historia">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
              <Image
                src="/images/tiendas/ancud.jpg"
                alt="Casa matriz de San Francisco Muebles en Ancud, esquina de Prat con Baquedano"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
                Casa matriz · Ancud
              </span>
            </div>
            <dl className="mt-6 grid grid-cols-3 divide-x divide-sand rounded-lg bg-white ring-1 ring-sand">
              {stats.map((s) => (
                <div key={s.label} className="px-3 py-4 text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl font-bold uppercase leading-none text-brand-blue md:text-3xl">
                    {s.value}
                  </dd>
                  <dd className="mt-1 text-xs text-ink-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <SectionTitle id="historia" eyebrow="Nuestra historia" title="Hechos en Ancud" />
            <div className="mt-5 space-y-4 text-lg text-ink-muted">
              <p>
                San Francisco Muebles nace en Ancud, Chiloé. Iniciamos formalmente nuestras actividades en el
                rubro del mueble el año 2000 y, gracias a una gran dedicación, el 2002 fabricamos nuestros
                primeros muebles propios.
              </p>
              <p>
                Operamos en el rubro del hogar y los muebles: además de productos para el bienestar y la
                decoración de tu casa, fabricamos nuestra propia línea de muebles y hacemos muebles a medida
                para cada proyecto que nos encargan.
              </p>
              <p>
                Nos dedicamos a entregar un excelente servicio, con gran calidad y el mayor compromiso con
                nuestra comunidad.
              </p>
            </div>

            {/* Línea de tiempo */}
            <ol className="relative mt-10 space-y-8 border-l-2 border-sand pl-8">
              {milestones.map((m) => (
                <li key={m.year} className="relative">
                  <span className="absolute -left-[2.6rem] top-0.5 flex size-5 items-center justify-center rounded-full bg-cream ring-2 ring-brand-orange">
                    <span className="size-2 rounded-full bg-brand-orange" />
                  </span>
                  <p className="font-display text-3xl font-bold leading-none text-brand-orange-dark">{m.year}</p>
                  <h3 className="mt-1 font-semibold text-ink">{m.title}</h3>
                  <p className="text-sm text-ink-muted">{m.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange-dark">Síguenos</span>
              <SocialLinks tone="light" />
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
