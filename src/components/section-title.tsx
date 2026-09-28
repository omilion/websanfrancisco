import { Plank } from "./plank";

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  id: string;
  /** "dark" para secciones con fondo azul. */
  tone?: "light" | "dark";
}

export function SectionTitle({ eyebrow, title, id, tone = "light" }: SectionTitleProps) {
  const dark = tone === "dark";
  return (
    <div>
      <Plank />
      <p
        className={`mt-3 text-sm font-semibold uppercase tracking-widest ${dark ? "text-brand-orange" : "text-brand-orange-dark"}`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-1 font-display text-2xl font-bold uppercase leading-none sm:text-3xl md:text-4xl ${dark ? "text-white" : "text-brand-blue"}`}
      >
        {title}
      </h2>
    </div>
  );
}
