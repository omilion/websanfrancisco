/** La "tabla" naranja que va sobre la A del logo, usada como acento sobre los títulos. */
export function Plank({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block h-1.5 w-12 -skew-x-12 rounded-[1px] bg-brand-orange ${className}`}
    />
  );
}
