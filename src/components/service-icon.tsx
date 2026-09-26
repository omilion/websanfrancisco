import {
  ClipboardList,
  Hammer,
  House,
  PencilRuler,
  Ruler,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const serviceIcons: Record<string, LucideIcon> = {
  cotizacion: ClipboardList,
  diseno: PencilRuler,
  proyectos: House,
  medicion: Ruler,
  despacho: Truck,
  instalacion: Wrench,
};

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = serviceIcons[slug] ?? Hammer;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
