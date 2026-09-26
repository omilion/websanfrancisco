import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { stores, whatsappUrl } from "@/config/site";
import { Plank } from "./plank";

/** Franja azul de cierre con llamado a cotizar. */
export function CtaBand({
  title = "¿Tienes un espacio en mente?",
  text = "Cuéntanos qué necesitas y te enviamos una cotización sin costo.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-brand-blue text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-xl">
          <Plank />
          <h2 className="mt-4 font-display text-4xl font-bold uppercase leading-none md:text-5xl">{title}</h2>
          <p className="mt-3 text-lg text-white/85">{text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/cotizar"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 font-semibold text-brand-blue transition-colors hover:bg-cream"
          >
            Cotizar sin costo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a
            href={whatsappUrl(stores[0].phone, "Hola, quiero hacer una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white/60 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
          >
            <MessageCircle className="size-5" aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
