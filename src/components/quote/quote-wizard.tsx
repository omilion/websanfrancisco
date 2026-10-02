"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  CheckCircle2,
  CookingPot,
  DoorClosed,
  FileText,
  ImagePlus,
  Loader2,
  Minus,
  PencilRuler,
  Plus,
  Tv,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { customProjectTypes } from "@/config/content";
import { useStores } from "@/components/stores-provider";
import { headquartersOf, whatsappUrl } from "@/config/site";
import {
  attachmentRules,
  dimensionLabels,
  getQuoteType,
  quoteDeadlines,
  quoteMaterials,
  quoteTypes,
  type QuoteField,
  type QuoteType,
} from "@/lib/quotes/schema";

const typeIcons: Record<string, LucideIcon> = {
  closet: DoorClosed,
  cocina: CookingPot,
  living: Tv,
  dormitorio: BedDouble,
  comedor: UtensilsCrossed,
  otro: PencilRuler,
};

const steps = ["¿Qué necesitas?", "Detalles", "Materiales y fotos", "Tus datos"];

type DetailValue = number | string | boolean;

interface Attachment {
  id: string;
  file: File;
  preview: string | null;
}

const inputClass =
  "mt-1 w-full rounded-md border border-sand bg-white px-3 py-2 text-base outline-none sm:mt-1.5 sm:py-2.5 transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

function initialDetails(type: QuoteType | undefined): Record<string, DetailValue> {
  const out: Record<string, DetailValue> = {};
  for (const f of type?.fields ?? []) out[f.name] = f.initial ?? (f.kind === "toggle" ? false : "");
  return out;
}

/** Reduce fotos grandes del celular antes de subirlas (máx. 2400 px, JPEG). Planos y PDF se envían tal cual. */
async function prepareFile(file: File): Promise<File> {
  const compressible = /^image\/(jpeg|png|webp)$/.test(file.type);
  if (!compressible || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function formatBytes(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function QuoteWizard() {
  const stores = useStores();
  const params = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const initialType = getQuoteType(params.get("tipo"));

  const [step, setStep] = useState(initialType ? 1 : 0);
  const [typeSlug, setTypeSlug] = useState(initialType?.slug ?? "");
  const type = getQuoteType(typeSlug);
  const [dims, setDims] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Record<string, DetailValue>>(() => initialDetails(initialType));
  const [material, setMaterial] = useState("");
  const [finish, setFinish] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [contact, setContact] = useState({
    nombre: "",
    telefono: "",
    email: "",
    comuna: "",
    tienda: "",
    plazo: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ id: string; code: string } | null>(null);

  // Libera las vistas previas al salir.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => () => filesRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)), []);

  function goTo(next: number) {
    setError(null);
    setStep(next);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function chooseType(slug: string) {
    if (slug !== typeSlug) {
      setTypeSlug(slug);
      setDims({});
      setDetails(initialDetails(getQuoteType(slug)));
    }
    goTo(1);
  }

  async function addFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list);
    const room = attachmentRules.maxFiles - files.length;
    if (room <= 0) return setError(`Puedes adjuntar hasta ${attachmentRules.maxFiles} archivos.`);
    const accepted = incoming.filter(
      (f) => attachmentRules.accept.split(",").includes(f.type) || /\.(heic|heif)$/i.test(f.name),
    );
    if (accepted.length < incoming.length)
      setError(`Algunos archivos no se aceptan. Formatos: ${attachmentRules.label}.`);
    setProcessing(true);
    const prepared: Attachment[] = [];
    for (const f of accepted.slice(0, room)) {
      const file = await prepareFile(f);
      if (file.size > attachmentRules.maxFileBytes) {
        setError(`"${f.name}" pesa más de 10 MB.`);
        continue;
      }
      const preview = /^image\/(jpeg|png|webp)$/.test(file.type) ? URL.createObjectURL(file) : null;
      prepared.push({ id: `${Date.now()}-${Math.random()}`, file, preview });
    }
    setFiles((prev) => [...prev, ...prepared]);
    setProcessing(false);
    if (incoming.length > room)
      setError(`Solo se agregaron ${room}: el máximo es ${attachmentRules.maxFiles} archivos.`);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
  }

  async function submit() {
    if (
      !contact.nombre.trim() ||
      contact.telefono.replace(/\D/g, "").length < 8 ||
      !contact.comuna.trim() ||
      !contact.tienda
    ) {
      return setError("Completa tu nombre, teléfono, comuna y la tienda que te atenderá.");
    }
    setSending(true);
    setError(null);
    const form = new FormData();
    form.set(
      "datos",
      JSON.stringify({
        tipo: typeSlug,
        medidas: dims,
        detalles: details,
        material,
        terminacion: finish,
        descripcion: description,
        ...contact,
      }),
    );
    files.forEach((f) => form.append("archivos", f.file, f.file.name));
    try {
      const res = await fetch("/api/cotizaciones", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; id?: string; code?: string; error?: string };
      if (!json.ok || !json.id || !json.code)
        throw new Error(json.error || "No pudimos enviar tu solicitud.");
      setResult({ id: json.id, code: json.code });
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  // ── Confirmación ──
  if (result && type) {
    const store = stores.find((s) => s.slug === contact.tienda) ?? headquartersOf(stores);
    const link = `${window.location.origin}/cotizacion/${result.id}`;
    const dimText = type.dimensions
      .filter((d) => dims[d])
      .map((d) => `${dimensionLabels[d]} ${dims[d]} cm`)
      .join(" · ");
    const summary = [
      `Hola, envié una solicitud de cotización desde la web (${result.code}).`,
      `*Proyecto:* ${type.name} a medida`,
      dimText ? `*Medidas:* ${dimText}` : null,
      files.length > 0 ? `*Adjuntos:* ${files.length} ${files.length === 1 ? "archivo" : "archivos"}` : null,
      `*Nombre:* ${contact.nombre}`,
    ].filter((l): l is string => Boolean(l));
    const message = `${summary.join("\n")}\n\nDetalle completo: ${link}`;

    return (
      <div ref={topRef} className="scroll-mt-28 text-center">
        <CheckCircle2 className="mx-auto size-14 text-brand-blue" strokeWidth={1.5} aria-hidden />
        <h2 className="mt-4 font-display text-3xl font-bold uppercase text-brand-blue">
          ¡Recibimos tu solicitud!
        </h2>
        <p className="mt-2 text-ink-muted">
          Tu código es <strong className="text-ink">{result.code}</strong>.
        </p>
        <p className="mx-auto mt-4 max-w-md text-ink">
          Para que la tienda de <strong>{store.city}</strong> te responda más rápido, envíale el aviso por
          WhatsApp: ya está escrito, solo presiona enviar.
        </p>
        <a
          href={whatsappUrl(store.whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          <FaWhatsapp className="size-5" aria-hidden />
          Enviar aviso a la tienda {store.city}
        </a>
        <p className="mt-6 text-sm">
          <a
            href={link}
            target="_blank"
            rel="noopener"
            className="font-medium text-brand-blue hover:underline"
          >
            Ver el resumen de mi solicitud
          </a>
        </p>
      </div>
    );
  }

  const canNext = step === 0 ? Boolean(type) : true;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progreso */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Pasos">
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={i > step || (i > 0 && !type)}
                onClick={() => goTo(i)}
                aria-current={current ? "step" : undefined}
                className="group w-full text-left disabled:cursor-default"
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors ${done || current ? "bg-brand-blue" : "bg-sand"}`}
                />
                <span
                  className={`mt-2 hidden text-xs font-semibold uppercase tracking-wide sm:block ${current ? "text-brand-blue" : done ? "text-ink" : "text-ink-muted"}`}
                >
                  {i + 1}. {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-blue sm:hidden">
        Paso {step + 1} de 4 · {steps[step]}
      </p>

      <div className="mt-5 sm:mt-8">
        {/* ── Paso 1: tipo ── */}
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-xl font-bold uppercase text-brand-blue sm:text-2xl md:text-3xl">
              ¿Qué quieres fabricar?
            </legend>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
              {quoteTypes.map((t) => {
                const Icon = typeIcons[t.slug] ?? PencilRuler;
                const selected = t.slug === typeSlug;
                const text = customProjectTypes.find((c) => c.slug === t.slug)?.text;
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => chooseType(t.slug)}
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition sm:flex-row sm:items-start sm:gap-4 sm:p-4 sm:text-left ${selected ? "border-brand-blue bg-brand-blue/5" : "border-sand bg-white hover:border-brand-blue/40"}`}
                  >
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full sm:size-12 ${selected ? "bg-brand-blue text-white" : "bg-brand-blue/10 text-brand-blue"}`}
                    >
                      <Icon className="size-5 sm:size-6" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-display text-base font-bold uppercase leading-tight text-brand-blue sm:text-xl">
                        {t.name}
                      </span>
                      {text && <span className="mt-0.5 hidden text-sm text-ink-muted sm:block">{text}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* ── Paso 2: detalles ── */}
        {step === 1 && type && (
          <div className="space-y-5 sm:space-y-8">
            <h2 className="font-display text-xl font-bold uppercase text-brand-blue sm:text-2xl md:text-3xl">
              {type.name}: detalles
            </h2>

            {type.dimensions.length > 0 && (
              <fieldset>
                <legend className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">
                  Medidas del espacio
                </legend>
                <p className="mt-1 text-xs text-ink-muted sm:text-sm">
                  Medidas referenciales en centímetros. Si no las tienes, déjalas en blanco: podemos medir más
                  adelante.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
                  {type.dimensions.map((d) => (
                    <label key={d} className="block">
                      <span className="text-xs font-semibold sm:text-sm">{dimensionLabels[d]}</span>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={10}
                          max={2000}
                          value={dims[d] ?? ""}
                          onChange={(e) => setDims((p) => ({ ...p, [d]: e.target.value }))}
                          placeholder="0"
                          className={`${inputClass} pr-8 sm:pr-10`}
                        />
                        <span className="pointer-events-none absolute bottom-2.5 right-2.5 text-xs text-ink-muted sm:bottom-3 sm:right-3 sm:text-sm">
                          cm
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {type.fields.length > 0 && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-6 sm:gap-y-6">
                {type.fields.map((f) => (
                  <DetailInput
                    key={f.name}
                    field={f}
                    value={details[f.name]}
                    onChange={(v) => setDetails((p) => ({ ...p, [f.name]: v }))}
                  />
                ))}
              </div>
            )}

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">
                Cuéntanos tu idea
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Qué quieres guardar, estilo, colores, cualquier detalle que nos ayude."
                className={inputClass}
              />
            </label>
          </div>
        )}

        {/* ── Paso 3: materiales y archivos ── */}
        {step === 2 && (
          <div className="space-y-5 sm:space-y-8">
            <h2 className="font-display text-xl font-bold uppercase text-brand-blue sm:text-2xl md:text-3xl">
              Materiales y fotos
            </h2>

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">
                Madera
              </legend>
              <Chips options={quoteMaterials} value={material} onChange={setMaterial} />
            </fieldset>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">
                Color o terminación
              </span>
              <span className="ml-2 text-xs text-ink-muted">Opcional</span>
              <input
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                maxLength={120}
                placeholder="Ej: natural con aceite, blanco, nogal oscuro"
                className={inputClass}
              />
            </label>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink sm:text-sm">
                Fotos, planos o bocetos
              </p>
              <p className="mt-1 text-xs text-ink-muted sm:text-sm">
                Una foto del espacio o un dibujo a mano con medidas nos ayuda mucho. Hasta{" "}
                {attachmentRules.maxFiles} archivos ({attachmentRules.label}).
              </p>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center sm:px-6 sm:py-8 transition ${dragging ? "border-brand-blue bg-brand-blue/5" : "border-sand bg-white hover:border-brand-blue/50"} ${files.length >= attachmentRules.maxFiles ? "pointer-events-none opacity-50" : ""}`}
              >
                {processing ? (
                  <Loader2 className="size-8 animate-spin text-brand-blue" aria-hidden />
                ) : (
                  <ImagePlus className="size-8 text-brand-blue" strokeWidth={1.5} aria-hidden />
                )}
                <span className="mt-2 font-semibold text-brand-blue">
                  {processing ? "Preparando archivos…" : "Toca para subir o arrastra aquí"}
                </span>
                <span className="mt-1 text-xs text-ink-muted">
                  Desde el celular puedes tomar la foto directamente
                </span>
                <input
                  type="file"
                  multiple
                  accept={attachmentRules.accept}
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.length) void addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {files.length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
                  {files.map((f) => (
                    <li key={f.id} className="relative overflow-hidden rounded-lg bg-white ring-1 ring-sand">
                      {f.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
                        <img
                          src={f.preview}
                          alt={f.file.name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-cream p-3">
                          <FileText className="size-8 text-brand-blue" strokeWidth={1.5} aria-hidden />
                          <span className="line-clamp-2 break-all text-center text-xs text-ink-muted">
                            {f.file.name}
                          </span>
                        </div>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-ink">
                        {formatBytes(f.file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        aria-label={`Quitar ${f.file.name}`}
                        className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Paso 4: contacto ── */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="font-display text-xl font-bold uppercase text-brand-blue sm:text-2xl md:text-3xl">
              Tus datos
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
              <Field label="Nombre" required>
                <input
                  value={contact.nombre}
                  onChange={(e) => setContact((c) => ({ ...c, nombre: e.target.value }))}
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
              <Field label="Teléfono (WhatsApp)" required>
                <input
                  type="tel"
                  value={contact.telefono}
                  onChange={(e) => setContact((c) => ({ ...c, telefono: e.target.value }))}
                  autoComplete="tel"
                  placeholder="+56 9 ..."
                  className={inputClass}
                />
              </Field>
              <Field label="Correo" hint="Opcional">
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
              <Field label="Comuna o sector" required>
                <input
                  value={contact.comuna}
                  onChange={(e) => setContact((c) => ({ ...c, comuna: e.target.value }))}
                  placeholder="Ej: Ancud, Chacao, Dalcahue"
                  className={inputClass}
                />
              </Field>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">
                Tienda que te atenderá<span className="text-brand-orange-dark"> *</span>
              </legend>
              <Chips
                options={stores.map((s) => s.city)}
                value={stores.find((s) => s.slug === contact.tienda)?.city ?? ""}
                onChange={(city) =>
                  setContact((c) => ({ ...c, tienda: stores.find((s) => s.city === city)?.slug ?? "" }))
                }
              />
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold">¿Para cuándo lo necesitas?</legend>
              <Chips
                options={quoteDeadlines}
                value={contact.plazo}
                onChange={(plazo) => setContact((c) => ({ ...c, plazo }))}
              />
            </fieldset>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md sm:mt-6 bg-brand-orange/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      {/* Navegación */}
      {step > 0 && (
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-sand pt-4 sm:mt-8 sm:pt-6">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-3 font-semibold text-brand-blue hover:bg-cream"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Atrás
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext || processing}
              onClick={() => goTo(step + 1)}
              className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-50"
            >
              Siguiente
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-md bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
              {sending ? "Enviando…" : "Enviar solicitud"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailInput({
  field,
  value,
  onChange,
}: {
  field: QuoteField;
  value: DetailValue | undefined;
  onChange: (v: DetailValue) => void;
}) {
  if (field.kind === "toggle") {
    const on = value === true;
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 ring-1 ring-sand sm:gap-4 sm:self-end sm:px-4 sm:py-3">
        <span className="text-xs font-semibold leading-tight sm:text-sm">{field.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={field.label}
          onClick={() => onChange(!on)}
          className={`relative h-6 w-10 shrink-0 rounded-full transition-colors sm:h-7 sm:w-12 ${on ? "bg-brand-blue" : "bg-sand"}`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all sm:top-1 ${on ? "left-[1.125rem] sm:left-6" : "left-0.5 sm:left-1"}`}
          />
        </button>
      </div>
    );
  }

  if (field.kind === "stepper") {
    const n = typeof value === "number" ? value : Number(value) || 0;
    const min = field.min ?? 0;
    const max = field.max ?? 99;
    return (
      <div>
        <span className="block text-xs font-semibold leading-tight sm:inline sm:text-sm">{field.label}</span>
        {field.hint && <span className="ml-2 hidden text-xs text-ink-muted sm:inline">{field.hint}</span>}
        <div
          className="mt-1 flex w-fit sm:mt-1.5 items-center rounded-full border border-sand bg-white"
          role="group"
          aria-label={field.label}
        >
          <button
            type="button"
            onClick={() => onChange(Math.max(min, n - 1))}
            disabled={n <= min}
            aria-label={`Menos ${field.label.toLowerCase()}`}
            className="flex size-9 items-center justify-center text-brand-blue disabled:opacity-30 sm:size-11"
          >
            <Minus className="size-4" aria-hidden />
          </button>
          <span
            className="w-8 text-center text-base font-bold tabular-nums sm:w-10 sm:text-lg"
            aria-live="polite"
          >
            {n}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, n + 1))}
            disabled={n >= max}
            aria-label={`Más ${field.label.toLowerCase()}`}
            className="flex size-9 items-center justify-center text-brand-blue disabled:opacity-30 sm:size-11"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <fieldset className="col-span-2">
        <legend className="text-xs font-semibold sm:text-sm">{field.label}</legend>
        <Chips options={field.options ?? []} value={String(value ?? "")} onChange={onChange} />
      </fieldset>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-semibold">{field.label}</span>
      {field.hint && <span className="ml-2 text-xs text-ink-muted">{field.hint}</span>}
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} ${field.unit ? "pr-20" : ""}`}
        />
        {field.unit && (
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 text-xs text-ink-muted sm:bottom-3 sm:right-3 sm:text-sm">
            {field.unit}
          </span>
        )}
      </div>
    </label>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2" role="radiogroup">
      {options.map((o) => {
        const selected = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o)}
            className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${selected ? "border-brand-blue bg-brand-blue text-white" : "border-sand bg-white text-ink hover:border-brand-blue/40"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label}
        {required && <span className="text-brand-orange-dark"> *</span>}
      </span>
      {hint && <span className="ml-2 text-xs text-ink-muted">{hint}</span>}
      {children}
    </label>
  );
}
