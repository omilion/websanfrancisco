import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { QuoteRequest } from "./schema";

// Las cotizaciones se guardan en disco (una carpeta por solicitud) hasta conectar un CRM o el ERP.
// Carpeta configurable con QUOTES_DIR; por defecto ./data/cotizaciones (ignorada por git).
const QUOTES_DIR = process.env.QUOTES_DIR || path.join(process.cwd(), "data", "cotizaciones");

const ID_PATTERN = /^[a-f0-9]{32}$/;
const FILE_PATTERN = /^archivo-\d+\.(jpg|png|webp|heic|pdf)$/;

export function newQuoteIds(): { id: string; code: string } {
  const id = randomBytes(16).toString("hex");
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const code = `COT-${date}-${randomBytes(2).toString("hex").toUpperCase()}`;
  return { id, code };
}

function quoteDir(id: string): string {
  if (!ID_PATTERN.test(id)) throw new Error("id inválido");
  return path.join(QUOTES_DIR, id);
}

export async function saveQuote(quote: QuoteRequest, files: { file: string; data: Buffer }[]): Promise<void> {
  const dir = quoteDir(quote.id);
  await mkdir(dir, { recursive: true });
  for (const f of files) {
    if (!FILE_PATTERN.test(f.file)) throw new Error("nombre de archivo inválido");
    await writeFile(path.join(dir, f.file), f.data);
  }
  await writeFile(path.join(dir, "cotizacion.json"), JSON.stringify(quote, null, 2));
}

export async function readQuote(id: string): Promise<QuoteRequest | null> {
  if (!ID_PATTERN.test(id)) return null;
  try {
    return JSON.parse(await readFile(path.join(quoteDir(id), "cotizacion.json"), "utf8")) as QuoteRequest;
  } catch {
    return null;
  }
}

export async function readAttachment(id: string, file: string): Promise<Buffer | null> {
  if (!ID_PATTERN.test(id) || !FILE_PATTERN.test(file)) return null;
  try {
    return await readFile(path.join(quoteDir(id), file));
  } catch {
    return null;
  }
}
