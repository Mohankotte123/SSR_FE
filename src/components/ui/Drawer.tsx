"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  headerExtra?: ReactNode;
}

/**
 * Glassmorphic slide-over drawer.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
  headerExtra,
}: DrawerProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed bottom-0 top-0 z-[60] flex w-full max-w-[400px] flex-col overflow-y-auto",
          "border-white/10 bg-gradient-to-b from-[#1A2038] to-midnight shadow-[-12px_0_60px_rgba(0,0,0,0.55)]",
          "transition-transform duration-[380ms] ease-[cubic-bezier(.4,0,.2,1)]",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
          className
        )}
      >
        {(title || headerExtra) && (
          <div className="border-b border-white/[0.08] bg-gradient-to-br from-gold/[0.06] to-transparent px-6 pb-5 pt-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="section-label mb-1.5">Plot Details</p>
                {title ? (
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-pearl">
                    {title}
                  </h2>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.07] text-[#8B97AD] hover:text-pearl"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {headerExtra}
          </div>
        )}
        <div className="flex-1 px-6 py-5">{children}</div>
      </aside>
    </>
  );
}
