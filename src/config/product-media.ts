// Fotos adicionales por código de producto del ERP, mientras no estén cargadas en el ERP.
// `antes`: se muestran antes de la foto del ERP (la primera queda como principal); `despues`: al final.
// Lo ideal es que Seba las suba al ERP (campo `galeria`) y se borren de aquí.

export const productMedia: Record<string, { antes?: string[]; despues?: string[] }> = {
  CL100: {
    antes: ["/images/productos/cl100-ambiente.jpg"],
    despues: ["/images/productos/cl100-detalle.jpg"],
  },
};
