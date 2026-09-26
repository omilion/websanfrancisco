import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogSkeleton, CatalogView } from "@/components/catalog/catalog-view";
import { PageHero } from "@/components/page-hero";
import { parseFilters } from "@/lib/catalog/filters";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Muebles de stock y a medida fabricados en Ancud. Filtra por categoría, precio o disponibilidad en nuestras tiendas de Chiloé.",
};

export default function ProductosPage(props: PageProps<"/productos">) {
  return (
    <>
      <PageHero
        eyebrow="Tienda"
        title="Catálogo"
        description="Muebles en stock listos para despacho y proyectos a medida. Filtra por la tienda más cercana para ver qué hay disponible."
      />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function CatalogResults({ searchParams }: Pick<PageProps<"/productos">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  return <CatalogView filters={filters} basePath="/productos" />;
}
