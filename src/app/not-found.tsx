import Link from "next/link";
import { Plank } from "@/components/plank";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center md:py-32">
      <Plank className="w-16" />
      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-orange-dark">Error 404</p>
      <h1 className="mt-2 font-display text-5xl font-bold uppercase leading-none text-brand-blue md:text-6xl">
        No encontramos esta página
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        Puede que el producto ya no esté disponible o que el link haya cambiado.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/productos" className="rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white hover:bg-brand-blue-dark">
          Ver catálogo
        </Link>
        <Link href="/" className="rounded-md border-2 border-brand-blue px-6 py-3 font-semibold text-brand-blue hover:bg-white">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
