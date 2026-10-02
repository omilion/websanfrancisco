import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { HeroSlide, HeroSlideContent } from "@/components/hero-carousel";
import { processSteps, type ProcessStep } from "@/config/content";
import { heroSlides, homeCustomImage } from "@/config/images";
import { fallbackStores, type Store } from "@/config/site";
import { fetchErpSiteContent, isErpConfigured } from "@/lib/erp/client";
import { publicImageUrl, slugify } from "@/lib/erp/mapper";
import type { ErpSiteContent, ErpSiteSlide, ErpSiteStore } from "@/lib/erp/types";

/** Tag de caché del contenido editable; el webhook /api/erp/revalidate lo invalida junto con el catálogo. */
export const SITE_CONTENT_TAG = "site-content";

export interface HomeBanner {
  desktop: string;
  mobile: string;
  alt: string;
  href: string;
}

export interface ProjectSection {
  image: { src: string; alt: string };
  pretitle: string;
  title: string;
  text: string;
  steps: ProcessStep[];
}

export interface SiteContent {
  slides: HeroSlide[];
  banner: HomeBanner | null;
  project: ProjectSection;
  stores: Store[];
}

/** Contenido de respaldo: lo que la tienda mostraba antes del módulo Sitio web del ERP. */
const fallbackContent: SiteContent = {
  slides: heroSlides,
  banner: {
    desktop: "/images/banners/sofas-desktop.jpg",
    mobile: "/images/banners/sofas-movil.jpg",
    alt: "Sofás y sillones San Francisco Muebles: diseños que combinan comodidad, estilo y fabricación a medida",
    href: "/categoria/sofas",
  },
  project: {
    image: homeCustomImage,
    pretitle: "Hecho a medida",
    title: "Lo hacemos para tu espacio exacto",
    text: "Cocinas, closets, bibliotecas o ese rincón difícil bajo la escalera. Diseñamos y fabricamos contigo, con maderas nobles y terminaciones a tu gusto.",
    steps: processSteps,
  },
  stores: fallbackStores,
};

/**
 * Carrusel, banner, sección a medida y sucursales, tal como se editan en el ERP (Sitio web y Sucursales).
 * Se refresca solo cada pocos minutos y al instante cuando el ERP avisa por el webhook. Si el ERP no responde,
 * se muestra el contenido de respaldo.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("minutes");
  cacheTag(SITE_CONTENT_TAG);

  if (!isErpConfigured()) return fallbackContent;
  try {
    return fromErp(await fetchErpSiteContent());
  } catch (error) {
    console.error("[sitio] No se pudo leer el contenido desde el ERP, se usa el respaldo:", error);
    return fallbackContent;
  }
}

export async function getStores(): Promise<Store[]> {
  return (await getSiteContent()).stores;
}

function fromErp(data: ErpSiteContent): SiteContent {
  const slides = markPageTitle(data.slides.map(toHeroSlide));
  const stores = data.sucursales.map(toStore);
  const project = data.proyecto;

  return {
    // Una portada sin carrusel o una tienda sin sucursales dejaría la página rota: en ese caso se usa el respaldo.
    slides: slides.length > 0 ? slides : fallbackContent.slides,
    banner: data.banner
      ? {
          desktop: publicImageUrl(data.banner.imagenEscritorioUrl),
          mobile: publicImageUrl(data.banner.imagenCelularUrl ?? data.banner.imagenEscritorioUrl),
          alt: data.banner.alt,
          href: data.banner.link,
        }
      : null,
    project: project
      ? {
          image: project.imagenUrl
            ? { src: publicImageUrl(project.imagenUrl), alt: project.alt }
            : fallbackContent.project.image,
          pretitle: project.pretitulo,
          title: project.titulo,
          text: project.texto,
          steps: project.pasos.map((p) => ({ title: p.titulo, text: p.texto, icon: p.icono })),
        }
      : fallbackContent.project,
    stores: stores.length > 0 ? stores : fallbackContent.stores,
  };
}

const ALIGN: Record<ErpSiteSlide["alineacion"], HeroSlideContent["align"]> = {
  izquierda: "left",
  centro: "center",
  derecha: "right",
};

function toHeroSlide(s: ErpSiteSlide): HeroSlide {
  const content: HeroSlideContent | undefined =
    s.conTexto && s.titulo
      ? {
          align: ALIGN[s.alineacion] ?? "left",
          pretitle: s.pretitulo ?? undefined,
          title: s.titulo,
          subtitle: s.texto ?? undefined,
          cta: s.botonTexto && s.botonLink ? { href: s.botonLink, label: s.botonTexto } : undefined,
        }
      : undefined;

  return {
    id: String(s.id),
    src: publicImageUrl(s.imagenEscritorioUrl),
    mobileSrc: s.imagenCelularUrl ? publicImageUrl(s.imagenCelularUrl) : undefined,
    alt: s.alt || s.titulo || "",
    content,
  };
}

/** El título del primer slide con texto es el h1 de la portada. */
function markPageTitle(slides: HeroSlide[]): HeroSlide[] {
  const first = slides.findIndex((s) => s.content);
  return slides.map((s, i) => (s.content ? { ...s, content: { ...s.content, isPageTitle: i === first } } : s));
}

/** "+56 9 8273 5261", "982735261" o "56982735261" → "+56982735261". */
function normalizePhone(raw: string | null): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 9) return `+56${digits}`;
  return `+${digits}`;
}

function toStore(s: ErpSiteStore): Store {
  const phone = normalizePhone(s.telefono) || normalizePhone(s.whatsapp);
  const city = s.comuna?.trim() || s.nombre;
  return {
    slug: slugify(s.codigo),
    name: /^tienda\b/i.test(s.nombre) ? s.nombre : `Tienda ${s.nombre}`,
    city,
    phone,
    whatsapp: normalizePhone(s.whatsapp) || phone,
    hours: s.horario?.trim() || null,
    address: s.direccion?.trim() || null,
    isHeadquarters: s.casaCentral,
    image: s.foto ? publicImageUrl(s.foto) : null,
  };
}
