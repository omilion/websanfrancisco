# San Francisco Muebles: tienda online

Tienda online de San Francisco Muebles (Ancud, Chiloé): muebles de stock con pago Webpay y muebles a medida con cotización.

Hecha con Next.js 16 (App Router, Cache Components), React 19, TypeScript y Tailwind CSS 4.

## Levantar en local

```bash
npm install
cp .env.example .env.local   # sin ERP_API_URL usa datos de prueba
npm run dev                  # http://localhost:3000
```

## Estado

| Página | Ruta | Estado |
|---|---|---|
| Landing | `/` | Lista |
| Catálogo con filtros (sucursal, tipo, categoría, precio, stock, búsqueda) | `/productos`, `/categoria/[slug]` | Lista |
| Ficha de producto | `/productos/[slug]` | Lista |
| A medida, Nosotros, Contacto, Cotizar | `/a-medida`, `/nosotros`, `/contacto`, `/cotizar` | Listas (formularios envían por WhatsApp) |
| Carrito y checkout | `/carrito`, `/checkout` | Front listo, **pago Webpay pendiente** |

## Integración con el ERP

El catálogo se lee del endpoint REST del ERP (API key) y se guarda en caché una hora.

- `src/lib/erp/types.ts`: formato **provisorio** de la respuesta del ERP. Se ajusta cuando lleguen los campos definitivos.
- `src/lib/erp/mapper.ts`: convierte el formato del ERP al modelo de la tienda (`src/lib/catalog/types.ts`). Es el único otro archivo que debería cambiar.
- `src/lib/erp/client.ts`: lectura paginada de productos y creación de pedidos (`POST`).
- `src/lib/erp/mock.ts`: datos de prueba, que se usan mientras `ERP_API_URL` esté vacío.
- **Webhook de cambios:** `POST /api/erp/revalidate` con el header `x-webhook-secret: <ERP_WEBHOOK_SECRET>`. Hace que la tienda vuelva a descargar el catálogo al instante.

Para el filtro por sucursal, el ERP debe entregar el stock de cada sucursal (`stock_sucursales`).

## Configuración del negocio

- `src/config/site.ts`: tiendas, teléfonos, servicios, reglas de despacho y comunas.
- `src/config/images.ts`: imágenes de la landing y de las páginas, y placeholders por tipo de mueble.
- `src/config/content.ts`: textos compartidos (proceso a medida, materiales).

## Documentos

- `docs/brief-imagenes.md`: brief de imágenes para Carla.
- `docs/entrega-imagenes.md`: notas de la entrega de imágenes (qué es ilustrativo y qué falta fotografiar).
