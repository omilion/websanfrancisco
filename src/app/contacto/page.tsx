import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { PendingText } from "@/components/pending-text";
import { SectionTitle } from "@/components/section-title";
import { StoreCard } from "@/components/store-card";
import { WhatsAppForm, type FormField } from "@/components/whatsapp-form";
import { pageImages } from "@/config/images";
import { site, stores } from "@/config/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctanos por WhatsApp, teléfono o correo. Tiendas en Ancud, Castro, Quellón y Quemchi.",
};

const contactFields: FormField[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true },
  { name: "telefono", label: "Teléfono", type: "tel", placeholder: "+56 9 ..." },
  {
    name: "motivo",
    label: "Motivo",
    type: "select",
    required: true,
    wide: true,
    options: ["Consulta por un producto", "Estado de mi pedido", "Mueble a medida", "Otro"],
  },
  { name: "mensaje", label: "Mensaje", type: "textarea", required: true, wide: true },
];

const headquarters = stores.find((s) => s.isHeadquarters) ?? stores[0];

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Conversemos"
        description="Escríbenos o visítanos en cualquiera de nuestras cuatro tiendas en Chiloé."
        image={{ ...pageImages.contacto, pending: "contacto" }}
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* ── Formulario ─────────────────────────────────── */}
        <div aria-labelledby="escribenos">
          <SectionTitle id="escribenos" eyebrow="Escríbenos" title="Envíanos tu consulta" />
          <div className="mt-8 rounded-lg bg-white p-6 ring-1 ring-sand md:p-8">
            <WhatsAppForm
              intro="Hola, les escribo desde la página web."
              fields={contactFields}
              submitLabel="Enviar por WhatsApp"
            />
          </div>
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-flex items-center gap-2 font-medium text-brand-blue hover:underline"
          >
            <Mail className="size-5" aria-hidden />
            También puedes escribirnos a {site.email}
          </a>
        </div>

        {/* ── Tiendas ────────────────────────────────────── */}
        <div aria-labelledby="tiendas">
          <SectionTitle id="tiendas" eyebrow="Visítanos" title="Nuestras tiendas" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {stores.map((store) => (
              <li key={store.slug}>
                <StoreCard store={store} tone="light" />
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PendingText>
              horarios de atención y direcciones de las tiendas de Castro, Quellón y Quemchi.
            </PendingText>
          </div>
        </div>
      </section>

      {/* ── Mapa casa matriz ─────────────────────────────── */}
      {headquarters.address && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-24" aria-label={`Mapa ${headquarters.name}`}>
          <div className="overflow-hidden rounded-lg ring-1 ring-sand">
            <iframe
              title={`Mapa de ${headquarters.name}: ${headquarters.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(headquarters.address + ", Chiloé, Chile")}&output=embed`}
              className="h-80 w-full md:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      )}
    </>
  );
}
