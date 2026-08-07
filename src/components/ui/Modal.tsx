"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  subtitle?: string;
}

/**
 * Frosted glass modal overlay.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(5,8,18,0.88)] p-6 backdrop-blur-[10px]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-lg overflow-hidden rounded-[22px] border border-white/10",
          "bg-gradient-to-br from-midnight to-[#171E35] shadow-[0_30px_80px_rgba(0,0,0,0.65)]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="border-b border-white/[0.08] bg-gradient-to-br from-gold/[0.07] to-transparent px-7 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {subtitle ? <p className="section-label mb-1.5">{subtitle}</p> : null}
                <h2 className="font-display text-[22px] font-extrabold tracking-tight text-pearl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] text-[#8B97AD] hover:text-pearl"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
        <div className="px-7 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-white/[0.08] px-7 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
