import Link from "next/link";
import type { ComponentProps } from "react";

/** Link de contenido editable desde el ERP: las rutas de la tienda usan <Link>, las direcciones externas abren en otra pestaña. */
export function SmartLink({ href, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
  if (/^https?:\/\//i.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  return <Link href={href} {...props} />;
}
