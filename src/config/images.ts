// Imágenes de la tienda (entrega de Carla, ver /imagenes/README.md en la raíz del proyecto).
// Mientras un valor sea null, <ImageSlot> muestra un bloque de color con el nombre del archivo pendiente.

import type { HeroSlide } from "@/components/hero-carousel";
import type { Product } from "@/lib/catalog/types";

export interface ResponsiveImage {
  desktop: string | null;
  mobile: string | null;
  alt: string;
}

export const landingImages = {
  hero: {
    desktop: "/images/landing/hero-desktop.jpg",
    mobile: "/images/landing/hero-movil.jpg",
    alt: "Living de una casa en Chiloé con sofá, mesa de madera y estufa a leña en un día de lluvia",
  },
  aMedida: {
    desktop: "/images/landing/a-medida-desktop.jpg",
    mobile: "/images/landing/a-medida-movil.jpg",
    alt: "Closet de madera hecho a medida bajo un techo inclinado",
  },
} satisfies Record<string, ResponsiveImage>;

/** Carrusel del banner principal de la portada, en orden. Formato ideal: 21:9 (brief-hero-21x9-carla.md). */
export const heroSlides: HeroSlide[] = [
  // 1 · Solo la foto de la casa central.
  {
    src: "/images/tiendas/ancud.jpg",
    alt: "Casa central de San Francisco Muebles en Ancud",
    // En celular se alinea a la izquierda; las demás imágenes van centradas.
    mobilePosition: "left center",
  },
  // 2 · Título de la página a la izquierda (foto provisoria: living).
  {
    src: "/images/landing/hero-desktop.jpg",
    mobileSrc: "/images/landing/hero-movil.jpg",
    alt: "Living de una casa en Chiloé con sofá, mesa de madera y estufa a leña",
    content: {
      align: "left",
      isPageTitle: true,
      title: "Muebles de madera hechos en Chiloé",
      subtitle: "Calidad, durabilidad y confort",
      cta: { href: "/productos", label: "Ver catálogo" },
    },
  },
  // 3 · Proyectos a medida, centrado.
  {
    src: "/images/landing/hero-cocina-castro.jpg",
    alt: "Cocina a medida en madera oscura con cubierta negra, fabricada por San Francisco Muebles",
    content: {
      align: "center",
      title: "Proyectos a medida",
      cta: { href: "/a-medida", label: "Conoce cómo trabajamos" },
    },
  },
];

/** Foto de la sección "Hecho a medida" de la portada (cocina a medida real, vertical 3:4). */
export const homeCustomImage = {
  src: "/images/landing/cocina-a-medida.jpg",
  alt: "Cocina a medida San Francisco Muebles: muebles negros, isla con cubierta de madera y vigas a la vista",
};

/** Banners de páginas internas. */
export const pageImages = {
  contacto: {
    desktop: "/images/paginas/contacto-desktop.jpg",
    mobile: "/images/paginas/contacto-movil.jpg",
    alt: "Calle de Chiloé con casas de tejuela en un día nublado",
  },
  cotizacion: {
    desktop: "/images/paginas/cotizacion-desktop.jpg",
    mobile: "/images/paginas/cotizacion-movil.jpg",
    alt: "Mesa de trabajo con boceto de un mueble, huincha y muestras de madera",
  },
  // PROVISORIA: imagen de muestra para la presentación al cliente. Reemplazar por la foto real del equipo.
  nosotros: {
    desktop: "/images/nosotros/equipo-referencial.jpg",
    mobile: "/images/nosotros/equipo-referencial.jpg",
    alt: "Equipo de San Francisco Muebles en la tienda",
  },
} satisfies Record<string, ResponsiveImage>;

/** Textura clara para fondos detrás de texto. */
export const woodBackground = "/images/landing/fondo-madera-suave.jpg";

/** Texturas de materiales, por slug de config/content.ts. */
export const materialImages: Record<string, string | null> = {
  encina: "/images/landing/material-encina.jpg",
  roble: "/images/landing/material-roble.jpg",
  tapiz: "/images/landing/material-tapiz.jpg",
};

/** Fotos del proceso a medida (galería). La de fabricación es ilustrativa: reemplazar por foto real del taller. */
export const processPhotos = [
  { src: "/images/landing/proceso-1-medicion.jpg", alt: "Manos midiendo un muro con huincha", caption: "Toma de medidas" },
  { src: "/images/landing/proceso-2-diseno.jpg", alt: "Boceto de un mueble con muestras de madera y telas", caption: "Diseño y asesoría" },
  { src: "/images/landing/proceso-3-fabricacion.jpg", alt: "Carpintero lijando una pieza de madera en el taller", caption: "Fabricación" },
  { src: "/images/landing/proceso-4-instalacion.jpg", alt: "Ajuste de la bisagra de un mueble instalado", caption: "Instalación" },
];

/** Imagen por slug de categoría del ERP. Las que falten muestran el bloque provisorio. */
export const categoryImages: Record<string, string | null> = {
  sofas: "/images/landing/cat-living.jpg",
  living: "/images/landing/cat-a-medida.jpg", // mueble de TV a muro
  comedor: "/images/landing/cat-comedor.jpg",
  dormitorio: "/images/landing/cat-dormitorio.jpg",
  cocina: "/images/landing/cat-cocina.jpg",
  closets: "/images/landing/cat-closets.jpg",
  "a-medida": "/images/landing/cat-a-medida.jpg",
};

export const productPlaceholder = "/images/placeholder/placeholder-producto.svg";

// Placeholder por tipo de mueble, así el catálogo se ve variado aunque falten fotos.
const placeholderBySubcategory: Record<string, string> = {
  sillas: "silla",
  mesas: "mesa",
  "mesas-de-centro": "mesa",
  camas: "cama",
  veladores: "generico",
  comodas: "generico",
  "muebles-base": "cocina",
  aereos: "cocina",
};
const placeholderByCategory: Record<string, string> = {
  sofas: "sofa",
  comedor: "mesa",
  dormitorio: "cama",
  closets: "closet",
  cocina: "cocina",
};

export function placeholderFor(product: Pick<Product, "categorySlug" | "subcategorySlug">): string {
  const kind =
    (product.subcategorySlug && placeholderBySubcategory[product.subcategorySlug]) ||
    placeholderByCategory[product.categorySlug];
  return kind ? `/images/placeholder/placeholder-${kind}.svg` : productPlaceholder;
}
