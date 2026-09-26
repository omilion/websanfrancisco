import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ServiceIcon } from "@/components/service-icon";
import { WhatsAppForm, type FormField } from "@/components/whatsapp-form";
import { customProjectTypes, materials } from "@/config/content";
import { pageImages } from "@/config/images";
import { services } from "@/config/site";

export const metadata: Metadata = {
  title: "Cotizar mueble a medida",
  description:
    "Cotiza sin costo tu mueble a medida: cocinas, closets, dormitorios y más, fabricados en Ancud.",
};

const quoteFields: FormField[] = [
  { name: "nombre", label: "Nombre", type: "text", required: true },
  { name: "telefono", label: "Teléfono", type: "tel", required: true, placeholder: "+56 9 ..." },
  { name: "comuna", label: "Comuna o sector", type: "text", required: true, placeholder: "Ej: Ancud, Chacao, Dalcahue" },
  {
    name: "tipo",
    label: "¿Qué necesitas?",
    type: "select",
    required: true,
    options: customProjectTypes.map((t) => t.name),
  },
  {
    name: "medidas",
    label: "Medidas aproximadas",
    type: "text",
    placeholder: "Ej: 2,40 m de ancho × 2,20 m de alto",
    wide: true,
  },
  {
    name: "madera",
    label: "Madera preferida",
    type: "select",
    options: [...materials.filter((m) => m.slug !== "tapiz").map((m) => m.name), "No sé, necesito asesoría"],
  },
  {
    name: "plazo",
    label: "¿Para cuándo lo necesitas?",
    type: "select",
    options: ["Lo antes posible", "En 1 a 2 meses", "En más de 2 meses", "Solo estoy cotizando"],
  },
  {
    name: "detalle",
    label: "Cuéntanos tu idea",
    type: "textarea",
    wide: true,
    placeholder: "Qué quieres guardar, estilo, color, cualquier detalle que nos ayude.",
  },
];

const quoteServices = services.filter((s) => s.appliesTo === "a-medida");

export default function CotizarPage() {
  return (
    <>
      <PageHero
        eyebrow="Cotización sin costo"
        title="Cotiza tu mueble a medida"
        description="Completa el formulario y te respondemos por WhatsApp. Si tienes fotos o planos de tu espacio, puedes enviarlos en el mismo chat."
        image={{ ...pageImages.cotizacion, pending: "cotizacion" }}
      />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div className="rounded-lg bg-white p-6 ring-1 ring-sand md:p-8">
          <WhatsAppForm
            intro="Hola, quiero cotizar un mueble a medida."
            fields={quoteFields}
            submitLabel="Enviar cotización por WhatsApp"
          />
        </div>

        <aside aria-label="Cómo te acompañamos">
          <h2 className="font-display text-3xl font-bold uppercase text-brand-blue">Te acompañamos</h2>
          <ul className="mt-6 space-y-5">
            {quoteServices.map((service) => (
              <li key={service.slug} className="flex gap-4">
                <ServiceIcon slug={service.slug} className="size-7 shrink-0 text-brand-orange-dark" />
                <div>
                  <h3 className="font-semibold text-ink">{service.title}</h3>
                  <p className="mt-0.5 text-sm text-ink-muted">{service.description}</p>
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
