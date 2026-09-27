import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow_Condensed, Figtree } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { formatPhone, stores, whatsappUrl } from "@/config/site";
import "./globals.css";

// Títulos: condensada y en mayúsculas, conversa con el logo y los banners de la marca.
const display = Barlow_Condensed({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Texto: sans cálida y muy legible.
const body = Figtree({
  variable: "--font-body-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // URL pública del sitio: la usan las imágenes para compartir en WhatsApp y redes.
  metadataBase: new URL(process.env.SITE_URL ?? "https://www.sanfranciscomuebles.cl"),
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "San Francisco Muebles",
  },
  title: {
    default: "San Francisco Muebles | Muebles a medida y de stock en Chiloé",
    template: "%s | San Francisco Muebles",
  },
  description:
    "Precisión artesanal desde el corazón de Chiloé. Muebles a medida y de stock fabricados en Ancud, con despacho en toda la isla.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Suspense fallback={null}>
          <WhatsAppFloat
            contacts={stores.map((s) => ({
              slug: s.slug,
              city: s.city,
              phoneLabel: formatPhone(s.phone),
              href: whatsappUrl(s.phone, "Hola, les escribo desde la página web."),
              isHeadquarters: s.isHeadquarters,
            }))}
          />
        </Suspense>
      </body>
    </html>
  );
}
