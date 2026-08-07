import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold";
  className?: string;
  dot?: boolean;
}

/**
 * Glass status / label badge.
 */
export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[11px] font-bold tracking-wide",
        tone === "neutral" &&
          "border border-white/15 bg-midnight/80 text-[#A8B8D8]",
        tone === "success" && "status-available",
        tone === "warning" && "status-reserved",
        tone === "danger" && "status-sold",
        tone === "info" && "border border-sky-500/20 bg-sky-500/10 text-sky-400",
        tone === "gold" &&
          "border border-gold/30 bg-gold/15 text-gold",
        className
      )}
      {...props}
    >
      {dot ? (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "dot-available",
            tone === "warning" && "dot-reserved",
            tone === "danger" && "dot-sold",
            tone === "gold" &&
              "inline-block bg-gold shadow-[0_0_6px_rgba(183,165,137,0.45)]",
            (tone === "neutral" || tone === "info") && "bg-current"
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
