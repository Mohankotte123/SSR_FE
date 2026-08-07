import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "whatsapp";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Atomic Button — glass / gold luxury variants.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-display font-bold transition-all duration-200 disabled:opacity-50",
        variant === "primary" &&
          "border border-white/10 bg-white/5 text-pearl hover:border-gold/35 hover:bg-white/10",
        variant === "secondary" &&
          "border border-white/25 bg-transparent text-pearl hover:bg-white/10",
        variant === "ghost" &&
          "bg-transparent text-[#5C6B82] hover:bg-white/5 hover:text-pearl",
        variant === "danger" &&
          "border border-plot-sold/25 bg-plot-sold/10 text-plot-sold hover:bg-plot-sold/20",
        variant === "gold" && "btn-gold",
        variant === "whatsapp" &&
          "bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.28)] hover:brightness-110",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
