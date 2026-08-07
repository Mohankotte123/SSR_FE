import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  wrapperClassName?: string;
  trailing?: ReactNode;
}

/**
 * Dark glass input field.
 */
export function Input({
  label,
  hint,
  error,
  className,
  wrapperClassName,
  trailing,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "h-11 w-full rounded-[11px] border border-white/10 bg-obsidian/50 px-4 text-sm text-pearl outline-none transition",
            "placeholder:text-[#5C6B82]",
            "focus:border-gold/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.08)]",
            error ? "border-plot-sold" : null,
            trailing != null ? "pr-10" : null,
            className
          )}
          {...props}
        />
        {trailing != null ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? <p className="text-xs text-plot-sold">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-[#5C6B82]">{hint}</p> : null}
    </div>
  );
}
