import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { CatalogSkeleton, CatalogView } from "@/components/catalog/catalog-view";
import { Plank } from "@/components/plank";
import { getCategories, getCategory } from "@/lib/catalog";
import { parseFilters } from "@/lib/catalog/filters";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name}: muebles de stock y a medida fabricados en Ancud, con despacho en toda la isla de Chiloé.`,
  };
}

export default function CategoriaPage(props: PageProps<"/categoria/[slug]">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CategoryContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: Pick<PageProps<"/categoria/[slug]">, "params" | "searchParams">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const filters = { ...parseFilters(await searchParams), categoria: category.slug };

  return (
    <>
      <section className="border-b border-sand">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <nav aria-label="Ruta de navegación">
            <ol className="flex items-center gap-1 text-sm text-ink-muted">
              <li>
                <Link href="/productos" className="inline-block py-2 hover:text-brand-blue hover:underline">
                  Catálogo
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-4" />
              </li>
              <li aria-current="page" className="font-medium text-ink">
                {category.name}
              </li>
            </ol>
          </nav>
          <Plank className="mt-4 w-12" />
          <h1 className="mt-4 font-display text-2xl font-bold uppercase leading-none text-brand-blue sm:text-4xl md:text-[2.75rem]">
            {category.name}
          </h1>
        </div>
      </section>
      <CatalogView filters={filters} basePath={`/categoria/${category.slug}`} lockedCategory />
    </>
  );
}
