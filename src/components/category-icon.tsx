import { Armchair, BedDouble, CookingPot, DoorClosed, Package, Sofa, Tv, UtensilsCrossed, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  comedor: UtensilsCrossed,
  dormitorio: BedDouble,
  living: Tv,
  sofas: Sofa,
  closets: DoorClosed,
  cocina: CookingPot,
  sillas: Armchair,
  // Grupos del ERP
  "sofas-seccionales": Sofa,
  "juegos-de-living": Sofa,
  "juegos-de-comedor": UtensilsCrossed,
  "mesas-de-arrimo": UtensilsCrossed,
  comodas: BedDouble,
  veladores: BedDouble,
  marquezas: BedDouble,
  "camas-americanas": BedDouble,
  infantiles: BedDouble,
  bases: CookingPot,
  compactos: CookingPot,
  lavaplatos: CookingPot,
  aereos: CookingPot,
  despensas: CookingPot,
  modulares: Tv,
  repiseros: Tv,
};

/** Ícono por slug de categoría del ERP (genérico si no hay uno definido). */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Package;
  return <Icon className={className} strokeWidth={1.75} aria-hidden />;
}
