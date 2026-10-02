"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useStores } from "@/components/stores-provider";
import { headquartersOf, whatsappUrl } from "@/config/site";

// Mientras no haya servicio de correo/CRM, los formularios arman el mensaje y lo abren
// en el WhatsApp de la tienda elegida. Así ninguna consulta se pierde en el camino.

export interface FormField {
  name: string;
  label: string;
  type: "text" | "tel" | "email" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Ocupa las dos columnas en escritorio. */
  wide?: boolean;
}

interface WhatsAppFormProps {
  /** Primera línea del mensaje, ej: "Hola, quiero cotizar un mueble a medida." */
  intro: string;
  fields: FormField[];
  submitLabel: string;
}

const STORE_FIELD = "tienda";

const inputClass =
  "mt-1.5 w-full rounded-md border border-sand bg-white px-3 py-2.5 text-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";

export function WhatsAppForm({ intro, fields, submitLabel }: WhatsAppFormProps) {
  const stores = useStores();
  const [sentTo, setSentTo] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const store = stores.find((s) => s.slug === data.get(STORE_FIELD)) ?? headquartersOf(stores);

    const lines = fields
      .map((f) => [f.label, String(data.get(f.name) ?? "").trim()] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => `*${label}:* ${value}`);

    const message = [intro, "", ...lines].join("\n");
    window.open(whatsappUrl(store.whatsapp, message), "_blank", "noopener,noreferrer");
    setSentTo(store.city);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className={`block ${field.wide ? "sm:col-span-2" : ""}`}>
          <span className="text-sm font-semibold text-ink">
            {field.label}
            {field.required && <span className="text-brand-orange-dark"> *</span>}
          </span>
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              className={inputClass}
            />
          ) : field.type === "select" ? (
            <select name={field.name} required={field.required} defaultValue="" className={inputClass}>
              <option value="" disabled>
                Elige una opción
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              autoComplete={field.type === "tel" ? "tel" : field.name === "nombre" ? "name" : undefined}
              className={inputClass}
            />
          )}
        </label>
      ))}

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold text-ink">
          Tienda que te atenderá<span className="text-brand-orange-dark"> *</span>
        </span>
        <select name={STORE_FIELD} required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Elige la tienda más cercana
          </option>
          {stores.map((store) => (
            <option key={store.slug} value={store.slug}>
              {store.city}
            </option>
          ))}
        </select>
      </label>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-blue px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-blue-dark sm:w-auto"
        >
          <MessageCircle className="size-5" aria-hidden />
          {submitLabel}
        </button>
        <p className="mt-3 text-xs text-ink-muted">
          Al enviar se abrirá WhatsApp con tu mensaje listo para la tienda que elegiste.
        </p>
        {sentTo && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-blue">
            <CheckCircle2 className="size-5" aria-hidden />
            Abrimos WhatsApp con tu mensaje para la tienda de {sentTo}. Solo falta presionar enviar.
          </p>
        )}
      </div>
    </form>
  );
}
