"use client";

import { usePathname } from "next/navigation";

interface WhatsAppFloatProps {
  href: string;
}

/** Botón flotante de WhatsApp (se oculta en el checkout para no distraer del pago). */
export function WhatsAppFloat({ href }: WhatsAppFloatProps) {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 md:bottom-7 md:right-7"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink opacity-0 shadow-lg ring-1 ring-sand transition group-hover:translate-x-0 group-hover:opacity-100 md:block">
        ¿Te ayudamos? Escríbenos
      </span>
      <span className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-transform group-hover:scale-105">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s]" aria-hidden />
        <svg viewBox="0 0 32 32" className="relative size-7" fill="currentColor" aria-hidden>
          <path d="M16.04 3C9.4 3 4 8.36 4 14.96c0 2.3.66 4.54 1.9 6.47L4 29l7.77-1.87a12.1 12.1 0 0 0 4.27.78C22.66 27.91 28 22.55 28 15.96 28 9.36 22.66 3 16.04 3Zm0 22.73c-1.35 0-2.68-.27-3.92-.8l-.28-.12-4.61 1.11 1.13-4.41-.19-.3a9.9 9.9 0 0 1-1.56-5.25c0-5.44 4.5-9.87 10.03-9.87 5.52 0 10.01 4.43 10.01 9.87s-4.5 9.77-10.61 9.77Zm5.5-7.33c-.3-.15-1.78-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.47-.9-.79-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.93-2.22-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.1 4.48.71.3 1.27.49 1.7.62.72.23 1.37.2 1.88.12.58-.09 1.78-.72 2.03-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
        </svg>
      </span>
    </a>
  );
}
