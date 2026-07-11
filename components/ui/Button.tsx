import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one button. Charcoal pill, gently elevates on hover.
 * `variant="ghost"` renders the quiet outlined counterpart.
 */
export default function Button({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-8 py-4 text-[0.8rem] font-normal tracking-[0.08em] transition-all duration-500 ease-out hover:-translate-y-0.5";
  const styles =
    variant === "solid"
      ? "bg-ink text-paper hover:shadow-[0_10px_30px_-12px_rgba(28,28,28,0.45)]"
      : "border border-ink/25 text-ink hover:border-ink/60";
  return (
    <Link href={href} data-cursor className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
