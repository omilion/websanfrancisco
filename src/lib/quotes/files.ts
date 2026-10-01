/** Detecta el tipo real del archivo por sus primeros bytes (no confía en el nombre ni en el navegador). */
export function sniffFile(buf: Buffer): { ext: string; type: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", type: "image/png" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { ext: "webp", type: "image/webp" };
  if (buf.toString("ascii", 0, 5) === "%PDF-") return { ext: "pdf", type: "application/pdf" };
  if (
    buf.toString("ascii", 4, 8) === "ftyp" &&
    /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(buf.toString("ascii", 8, 12))
  )
    return { ext: "heic", type: "image/heic" };
  return null;
}
