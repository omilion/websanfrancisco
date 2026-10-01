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
| Carrito y pago con Webpay | `/carrito`, `/checkout`, `/checkout/resultado` | Listo (certificación). Ver "Modo de venta" |
| Cotizador a medida con fotos y planos | `/cotizar`, `/cotizacion/[id]` | Listo (solicitudes en `data/cotizaciones`) |

## Integración con el ERP

El catálogo se lee del endpoint REST del ERP (API key) y se guarda en caché una hora.

- `src/lib/erp/types.ts`: formato **provisorio** de la respuesta del ERP. Se ajusta cuando lleguen los campos definitivos.
- `src/lib/erp/mapper.ts`: convierte el formato del ERP al modelo de la tienda (`src/lib/catalog/types.ts`). Es el único otro archivo que debería cambiar.
- `src/lib/erp/client.ts`: lectura de productos, registro de pedidos pagados y envío de cotizaciones.
- `src/lib/erp/mock.ts`: datos de prueba, que se usan mientras `ERP_API_URL` esté vacío.
- **Webhook de cambios:** `POST /api/erp/revalidate` con el header `x-webhook-secret: <ERP_WEBHOOK_SECRET>`. Hace que la tienda vuelva a descargar el catálogo al instante.

Para el filtro por sucursal, el ERP debe entregar el stock de cada sucursal (`stock_sucursales`).

## Modo de venta

`commerce.onlinePayments` en `src/config/site.ts`:

- `true` (actual): el carrito termina en `/checkout` y se paga con **Webpay Plus**. Solo se vende el stock de la bodega web del ERP ("INTERNET" o "BODEGA WEB").
- `false`: se muestran los precios, pero el carrito termina en una **solicitud de cotización** (`/solicitar-cotizacion`) y no aparece Webpay.

### Flujo de pago

1. `CheckoutForm` → `POST /api/webpay/crear`: revalida precio y stock contra el catálogo, guarda el pedido en `data/pedidos/<orden>.json` y crea la transacción en Transbank.
2. El navegador va a Webpay con `token_ws` (POST). Webpay vuelve a `/checkout/webpay/retorno`, que confirma la transacción, valida el monto y marca el pedido `pagado`.
3. `POST /api/ecommerce/pedidos` del ERP registra la venta (origen `web`: cliente, cobro, stock, despacho o retiro). Es idempotente por orden de compra. Si el ERP no responde, el pedido queda `pagado` y se reintenta al abrir `/checkout/resultado` o con `POST /api/webpay/reintentar` (header `x-webhook-secret`, pensado para un cron).
4. `/checkout/resultado` muestra el comprobante y vacía el carrito.

Ambiente: `WEBPAY_ENV=integration` (certificación, tarjeta de prueba `4051 8856 0044 6623`, RUT `11.111.111-1`, clave `123`). Para producción, `WEBPAY_ENV=production` con `WEBPAY_COMMERCE_CODE` y `WEBPAY_API_KEY` reales.

### Cotizaciones hacia el ERP

Se guardan primero en la tienda (`data/cotizaciones`) y se envían a `POST /api/ecommerce/cotizaciones` del ERP (módulo Cotizaciones):

- **Personalizada**: formulario bajo el producto (`PersonalizedQuote`), mismo mueble con otro color o tamaño. `POST /api/cotizaciones/personalizada`.
- **A medida** (proyecto): cotizador de `/cotizar`. `POST /api/cotizaciones`.

Si el ERP no responde, la solicitud queda guardada y se reenvía con `POST /api/webpay/reintentar`.

## Configuración del negocio

- `src/config/site.ts`: tiendas, teléfonos, servicios, reglas de despacho y comunas.
- `src/config/images.ts`: imágenes de la landing y de las páginas, y placeholders por tipo de mueble.
- `src/config/content.ts`: textos compartidos (proceso a medida, materiales).

## Documentos

- `docs/brief-imagenes.md`: brief de imágenes para Carla.
- `docs/entrega-imagenes.md`: notas de la entrega de imágenes (qué es ilustrativo y qué falta fotografiar).
