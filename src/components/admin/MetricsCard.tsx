import { Card, CardBody } from "@/components/ui/Card";
import { cn, formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MetricsCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  accent?: "gold" | "emerald" | "amber" | "slate" | "crimson";
  trend?: "up" | "down" | "neutral";
}

const ACCENT = {
  gold: {
    color: "#B7A589",
    bg: "rgba(183,165,137,0.09)",
    border: "rgba(183,165,137,0.18)",
  },
  emerald: {
    color: "#2E9E6B",
    bg: "rgba(46,158,107,0.09)",
    border: "rgba(46,158,107,0.18)",
  },
  amber: {
    color: "#C4923A",
    bg: "rgba(196,146,58,0.09)",
    border: "rgba(196,146,58,0.18)",
  },
  slate: {
    color: "#8B97AD",
    bg: "rgba(139,151,173,0.08)",
    border: "rgba(139,151,173,0.14)",
  },
  crimson: {
    color: "#C45A4A",
    bg: "rgba(196,90,74,0.09)",
    border: "rgba(196,90,74,0.18)",
  },
} as const;

/**
 * Glass KPI card (Figma Admin Dashboard).
 */
export function MetricsCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  accent = "gold",
  trend = "neutral",
}: MetricsCardProps) {
  const display = typeof value === "number" ? formatNumber(value) : value;
  const theme = ACCENT[accent];

  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      style={{
        background: theme.bg,
        borderColor: theme.border,
      }}
    >
      <div
        className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full"
        style={{
          background: `radial-gradient(circle, ${theme.color}18 0%, transparent 70%)`,
        }}
      />
      <CardBody className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="max-w-[120px] text-[10.5px] font-semibold uppercase leading-snug tracking-[0.08em] text-[#5C6B82]">
            {label}
          </p>
          {Icon ? (
            <Icon className="h-5 w-5 shrink-0" style={{ color: theme.color }} />
          ) : null}
        </div>
        <p
          className="font-display text-[32px] font-extrabold leading-none tracking-tight"
          style={{ color: theme.color }}
        >
          {display}
        </p>
        {hint ? (
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-bold"
              style={{
                color:
                  trend === "up"
                    ? "#2E9E6B"
                    : trend === "down"
                      ? "#C45A4A"
                      : "#8B97AD",
              }}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
            <span className="text-[11.5px] text-[#5C6B82]">{hint}</span>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
