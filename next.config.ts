import type { NextConfig } from "next";

// Fotos de producto que entrega el ERP (ej. http://144.91.88.57:3011/uploads/productos/…).
// ERP_IMAGES_ORIGIN acepta uno o más orígenes separados por coma; si falta, se usa ERP_API_URL.
function erpImagePatterns() {
  const origins = (process.env.ERP_IMAGES_ORIGIN || process.env.ERP_API_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  return origins.flatMap((origin) => {
    try {
      const url = new URL(origin);
      return [
        {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port,
          pathname: "/uploads/**",
        },
      ];
    } catch {
      return [];
    }
  });
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: erpImagePatterns(),
  },
};

export default nextConfig;
