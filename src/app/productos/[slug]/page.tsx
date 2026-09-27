import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Ruler,
  Store as StoreIcon,
  Truck,
  Wrench,
} from "lucide-react";
import { AddToCart } from "@/components/product/add-to-cart";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { categoryImages, placeholderFor } from "@/config/images";
import { fulfillment, stores, whatsappUrl } from "@/config/site";
import { getCatalog, getCategory, getProductBySlug } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images[0]?.url ?? categoryImages[product.categorySlug] ?? undefined;
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default function ProductPage(props: PageProps<"/productos/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={props.params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/productos/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [category, { products }] = await Promise.all([getCategory(product.categorySlug), getCatalog()]);
  const subcategory = category?.subcategories.find((s) => s.slug === product.subcategorySlug);
  const related = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const isStock = product.saleMode === "stock";
  const inStock = isStock && product.stock > 0 && product.price !== null;
  const placeholder = { url: placeholderFor(product), alt: `${product.name} (foto próximamente)` };
  const headquarters = stores.find((s) => s.isHeadquarters) ?? stores[0];
  const productRef = `${product.name} (${product.sku})`;

  return (
    <>
      <ProductJsonLd product={product} image={product.images[0]?.url} />
      <MobileBuyBar
        name={product.name}
        price={product.price}
        targetId="comprar"
        action={
          inStock
            ? {
                kind: "comprar",
                sku: product.sku,
                slug: product.slug,
                image: product.images[0]?.url ?? placeholder.url,
                stock: product.stock,
              }
            : isStock
              ? {
                  kind: "consultar",
                  href: whatsappUrl(
                    headquarters.phone,
                    `Hola, ¿cuándo vuelve a estar disponible ${productRef}?`,
                  ),
                }
              : { kind: "cotizar", href: "/cotizar" }
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* ── Ruta ─────────────────────────────────────────── */}
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
            <li>
              <Link href="/productos" className="inline-block py-2 hover:text-brand-blue hover:underline">
                Catálogo
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden>
                  <ChevronRight className="size-4" />
                </li>
                <li>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="inline-block py-2 hover:text-brand-blue hover:underline"
                  >
                    {category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>
              <ChevronRight className="size-4" />
            </li>
            <li aria-current="page" className="font-medium text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} placeholder={placeholder} />

          {/* ── Información ──────────────────────────────── */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange-dark">
              {subcategory?.name ?? category?.name}
              {!isStock && " · A medida"}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none text-brand-blue md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-ink-muted">SKU: {product.sku}</p>

            <div className="mt-6">
              {product.price !== null ? (
                <>
                  <p className="text-3xl font-bold text-ink">{formatPrice(product.price)}</p>
                  <p className="text-sm text-ink-muted">IVA incluido</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-ink">Precio según medidas</p>
                  <p className="text-sm text-ink-muted">Te enviamos la cotización sin costo</p>
                </>
              )}
            </div>

            {product.shortDescription && <p className="mt-5 text-lg text-ink">{product.shortDescription}</p>}

            {/* Compra / cotización */}
            <div id="comprar" className="mt-8 scroll-mt-28 rounded-lg bg-white p-5 ring-1 ring-sand">
              {inStock ? (
                <>
                  <p className="mb-4 text-sm font-semibold text-brand-blue">
                    ● Disponible · {product.stock} {product.stock === 1 ? "unidad" : "unidades"} en tiendas
                  </p>
                  <AddToCart
                    sku={product.sku}
                    slug={product.slug}
                    name={product.name}
                    price={product.price!}
                    image={product.images[0]?.url ?? placeholder.url}
                    stock={product.stock}
                  />
                </>
              ) : isStock ? (
                <>
                  <p className="text-sm font-semibold text-ink">Agotado por ahora</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Escríbenos para saber cuándo vuelve, o te lo fabricamos a medida.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={whatsappUrl(
                        headquarters.phone,
                        `Hola, ¿cuándo vuelve a estar disponible ${productRef}?`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-blue px-5 py-3 font-semibold text-white hover:bg-brand-blue-dark"
                    >
                      <MessageCircle className="size-5" aria-hidden />
                      Consultar reposición
                    </a>
                    <Link
                      href="/cotizar"
                      className="inline-flex flex-1 items-center justify-center rounded-md border-2 border-brand-blue px-5 py-2.5 font-semibold text-brand-blue hover:bg-cream"
                    >
                      Cotizar a medida
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-ink-muted">
                    Lo diseñamos contigo: medidas, madera, distribución y terminación. Fabricado en nuestro
                    taller de Ancud.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/cotizar"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-blue px-5 py-3.5 font-semibold text-white hover:bg-brand-blue-dark"
                    >
                      Cotizar sin costo
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <a
                      href={whatsappUrl(headquarters.phone, `Hola, quiero cotizar: ${productRef}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-brand-blue px-5 py-3 font-semibold text-brand-blue hover:bg-cream"
                    >
                      <MessageCircle className="size-5" aria-hidden />
                      WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Stock por tienda */}
            {isStock && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink">
                  Disponibilidad por tienda
                </h2>
                <ul className="mt-3 divide-y divide-sand rounded-lg bg-white ring-1 ring-sand">
                  {stores.map((store) => {
                    const n = product.stockByStore[store.slug] ?? 0;
                    return (
                      <li
                        key={store.slug}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span className="font-semibold">{store.city}</span>
                        <span
                          className={`ml-auto ${n > 0 ? "font-medium text-brand-blue" : "text-ink-muted"}`}
                        >
                          {n > 0 ? `${n} ${n === 1 ? "disponible" : "disponibles"}` : "Sin stock"}
                        </span>
                        <a
                          href={whatsappUrl(
                            store.phone,
                            `Hola, ¿tienen disponible ${productRef} en la tienda de ${store.city}?`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Consultar en ${store.city} por WhatsApp`}
                          className="-my-1 rounded-full p-2.5 text-brand-blue hover:bg-sand"
                        >
                          <MessageCircle className="size-4" aria-hidden />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Entrega */}
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3">
                <Truck className="size-5 shrink-0 text-brand-orange-dark" aria-hidden />
                <span>
                  <strong>Despacho a domicilio</strong> en toda la {fulfillment.shippingArea}. Costo según
                  destino.
                </span>
              </li>
              {isStock && fulfillment.storePickup && (
                <li className="flex gap-3">
                  <StoreIcon className="size-5 shrink-0 text-brand-orange-dark" aria-hidden />
                  <span>
                    <strong>Retiro en tienda</strong> en la sucursal que tenga stock.
                  </span>
                </li>
              )}
              <li className="flex gap-3">
                <Wrench className="size-5 shrink-0 text-brand-orange-dark" aria-hidden />
                <span>
                  <strong>Armado e instalación</strong> disponible, se cotiza según el proyecto.
                </span>
              </li>
              {!isStock && (
                <li className="flex gap-3">
                  <Ruler className="size-5 shrink-0 text-brand-orange-dark" aria-hidden />
                  <span>
                    <strong>Medición a domicilio</strong> para que calce exacto en tu espacio.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Descripción y medidas ──────────────────────── */}
        <div className="mt-14 grid gap-10 border-t border-sand pt-10 md:grid-cols-[1.5fr_1fr] md:gap-14">
          <section aria-labelledby="descripcion">
            <h2 id="descripcion" className="font-display text-3xl font-bold uppercase text-brand-blue">
              Descripción
            </h2>
            <p className="mt-4 whitespace-pre-line text-ink-muted">
              {product.description || product.shortDescription}
            </p>
          </section>
          <section aria-labelledby="medidas">
            <h2 id="medidas" className="font-display text-3xl font-bold uppercase text-brand-blue">
              Medidas
            </h2>
            <Dimensions product={product} />
          </section>
        </div>
      </div>

      {/* ── Relacionados ─────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-sand/50" aria-labelledby="relacionados">
          <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
            <SectionTitle
              id="relacionados"
              eyebrow="También te puede gustar"
              title={category ? `Más de ${category.name}` : "Productos relacionados"}
            />
            <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id} className="flex">
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function Dimensions({ product }: { product: Product }) {
  const { width, height, depth } = product.dimensions;
  const rows = [
    ["Ancho", width],
    ["Alto", height],
    ["Profundidad", depth],
  ] as const;

  if (rows.every(([, v]) => v === null)) {
    return (
      <p className="mt-4 text-ink-muted">
        {product.saleMode === "a-medida"
          ? "Se fabrica con las medidas exactas de tu espacio."
          : "Consúltanos por las medidas de este producto."}
      </p>
    );
  }

  return (
    <dl className="mt-4 divide-y divide-sand rounded-lg bg-white ring-1 ring-sand">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between px-4 py-3 text-sm">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="font-semibold">{value !== null ? `${value} cm` : "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Datos estructurados para que Google muestre precio y disponibilidad. */
function ProductJsonLd({ product, image }: { product: Product; image?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription || product.description,
    image: image ? [image] : undefined,
    brand: { "@type": "Brand", name: "San Francisco Muebles" },
    offers:
      product.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "CLP",
            price: product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          }
        : undefined,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2" aria-busy>
      <div className="aspect-square animate-pulse rounded-lg bg-sand/60" />
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-sand/60" />
        <div className="h-12 w-3/4 animate-pulse rounded bg-sand/60" />
        <div className="h-8 w-40 animate-pulse rounded bg-sand/60" />
        <div className="h-40 animate-pulse rounded-lg bg-sand/60" />
      </div>
    </div>
  );
}
