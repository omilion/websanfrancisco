# Pendientes para Seba: cotizaciones web (auditoría del 03-11-2026)

Quedan para cuando la tienda tenga dominio propio.

## 1. Correo de las cotizaciones

- En af05814 el correo quedó obligatorio en los formularios, con el texto «para enviarte la cotización».
- Hoy nadie manda ese correo:
  - La tienda no envía ningún correo de confirmación.
  - En producción el ERP no tiene `MAIL_SMTP_HOST` ni el resto de `MAIL_SMTP_*` en `/opt/sanf-erp/.env`, así que «Enviar por correo» en Cotizaciones falla.
- **Qué falta**:
  1. Configurar SMTP en el ERP con una cuenta del dominio.
  2. Decidir si la tienda manda un acuse de recibo al cliente.
  3. Mientras no esté, evaluar si el correo debe seguir siendo obligatorio.

## 2. Reintento automático hacia el ERP

- Si el ERP no responde, la tienda guarda la cotización (o el pedido pagado con Webpay) en su disco y la marca como pendiente.
- El reintento existe, `POST /api/webpay/reintentar` con el header `x-webhook-secret: $ERP_WEBHOOK_SECRET`, pero nada lo llama: no hay cron en el VPS.
- Hoy no hay pendientes, pero si el ERP se cae quedan ahí hasta que alguien lo corra a mano.
- **Qué falta**: un cron que lo llame, por ejemplo cada 15 minutos, cuando la tienda quede detrás de nginx con dominio.

## Contexto

Ya se resolvió en esta misma tanda, pendiente de deploy:

- Las medidas pasan a milímetros en el ERP (migración `20261124120000_cotizaciones_medidas_mm`).
- La tienda envía solo los campos que el cliente responde.
- El cliente ve el código del ERP.
- La comuna es una lista.
- Se eliminó `/solicitar-cotizacion`, que ahora redirige a `/cotizar`.
