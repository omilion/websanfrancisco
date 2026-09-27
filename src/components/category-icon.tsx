import { Armchair, BedDouble, CookingPot, DoorClosed, Package, Sofa, Tv, UtensilsCrossed, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  comedor: UtensilsCrossed,
  dormitorio: BedDouble,
  living: Tv,
  sofas: Sofa,
  closets: DoorClosed,
  cocina: CookingPot,
  sillas: Armchair,
};

/** Ícono por slug de categoría del ERP (genérico si no hay uno definido). */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Package;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
