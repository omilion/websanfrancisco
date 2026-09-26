import type { NextConfig } from "next";

// Host de las imágenes que entrega el ERP (se define cuando Seba confirme el endpoint).
const erpImagesHost = process.env.ERP_IMAGES_HOST;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: erpImagesHost
      ? [{ protocol: "https", hostname: erpImagesHost }]
      : [],
  },
};

export default nextConfig;
