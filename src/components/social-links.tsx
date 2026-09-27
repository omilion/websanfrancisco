import { site } from "@/config/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a21 21 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.15H7.92v2.94h2.54V21h3.04Z" />
    </svg>
  );
}

const networks = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, ...site.social.instagram },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, ...site.social.facebook },
];

/** Enlaces a redes sociales. "dark" sobre fondo azul, "light" sobre fondo claro. */
export function SocialLinks({ tone = "dark", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <ul className={`flex items-center gap-2 ${className}`} aria-label="Redes sociales">
      {networks.map(({ key, label, url, handle, Icon }) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}: ${handle}`}
            title={`${label} · ${handle}`}
            className={`flex size-11 items-center justify-center rounded-full transition-colors ${
              dark
                ? "border border-cream/20 text-cream hover:border-brand-orange hover:bg-brand-orange hover:text-ink"
                : "border border-sand bg-white text-brand-blue hover:border-brand-blue hover:bg-brand-blue hover:text-white"
            }`}
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}
