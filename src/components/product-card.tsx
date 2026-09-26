import Image from "next/image";
import Link from "next/link";
import { placeholderFor } from "@/config/images";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

/** `note`: línea extra opcional, ej. "3 disponibles en Castro". */
export function ProductCard({ product, note }: { product: Product; note?: string }) {
  const image = product.images[0];
  const soldOut = product.saleMode === "stock" && product.stock === 0;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_1px_0_var(--sand)] ring-1 ring-sand transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Image
          src={image?.url ?? placeholderFor(product)}
          alt={image?.alt ?? `${product.name} (foto próximamente)`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.saleMode === "a-medida" && (
          <span className="absolute left-3 top-3 rounded bg-brand-blue px-2 py-0.5 text-xs font-semibold text-white">
            A medida
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded bg-ink/80 px-2 py-0.5 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug group-hover:text-brand-blue">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{product.shortDescription}</p>
        {note && <p className="mt-2 text-xs font-semibold text-brand-orange-dark">{note}</p>}
        <p className="mt-auto pt-3 text-lg font-bold text-brand-blue">
          {product.price !== null ? formatPrice(product.price) : "Cotizar"}
        </p>
      </div>
    </Link>
  );
}
