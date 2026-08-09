import type { Plot } from "@/types/database";

export const SQ_FT_PER_GADHI = 72;
export const SQ_FT_PER_SQ_YARD = 9;

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Coerce Prisma Decimal strings / numbers safely. */
export function num(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Prefer Gadhi pricing, then Sq.Ft, then Sq.Yd. */
export function plotTotal(
  plot: Pick<
    Plot,
    | "areaSqYards"
    | "pricePerSqYard"
    | "areaGadhi"
    | "pricePerGadhi"
    | "areaSqFt"
    | "pricePerSqFt"
  >
): number {
  const gadhi = num(plot.areaGadhi);
  const perGadhi = num(plot.pricePerGadhi);
  if (gadhi > 0 && perGadhi > 0) return gadhi * perGadhi;

  const sqFt = num(plot.areaSqFt);
  const perSqFt = num(plot.pricePerSqFt);
  if (sqFt > 0 && perSqFt > 0) return sqFt * perSqFt;

  return num(plot.areaSqYards) * num(plot.pricePerSqYard);
}

export function hasPlotDimensions(
  plot: Pick<Plot, "eastDim" | "westDim" | "northDim" | "southDim">
): boolean {
  return Boolean(
    plot.eastDim?.trim() &&
      plot.westDim?.trim() &&
      plot.northDim?.trim() &&
      plot.southDim?.trim()
  );
}

/** e.g. "19.16 Gadhi (1,379.84 Sq. Ft.)" */
export function formatGadhiSqFt(
  plot: Pick<Plot, "areaGadhi" | "areaSqFt" | "areaSqYards">
): string {
  const gadhi = num(plot.areaGadhi);
  const sqFt = num(plot.areaSqFt);
  if (gadhi > 0 && sqFt > 0) {
    return `${formatDecimal(gadhi)} Gadhi (${formatDecimal(sqFt)} Sq. Ft.)`;
  }
  if (sqFt > 0) return `${formatDecimal(sqFt)} Sq. Ft.`;
  if (gadhi > 0) return `${formatDecimal(gadhi)} Gadhi`;
  const yd = num(plot.areaSqYards);
  return yd > 0 ? `${formatDecimal(yd)} Sq. Yd` : "—";
}

export function formatDecimal(
  value: number | null | undefined,
  maxFractionDigits = 2
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Equivalent ₹/Gadhi from ₹/Sq.Yd (1 Gadhi = 8 Sq.Yd). */
export function ratePerGadhiFromSqYard(ratePerSqYard: number): number {
  return ratePerSqYard * (SQ_FT_PER_GADHI / SQ_FT_PER_SQ_YARD);
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "INR"
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN").format(value);
}

/** Default agreement window used when notes say “within 6 months”. */
export const DEFAULT_BALANCE_DUE_DAYS = 180;

export function bookingDueDate(
  bookingDate: string,
  dueDays = DEFAULT_BALANCE_DUE_DAYS
): Date {
  const d = new Date(bookingDate);
  if (Number.isNaN(d.getTime())) return new Date();
  const due = new Date(d);
  due.setDate(due.getDate() + dueDays);
  return due;
}

export function bookingTimeLeft(bookingDate: string): {
  dueDate: Date;
  daysLeft: number;
  overdue: boolean;
  label: string;
} {
  const dueDate = bookingDueDate(bookingDate);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  const daysLeft = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const overdue = daysLeft < 0;
  const label = overdue
    ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"}`
    : daysLeft === 0
      ? "Due today"
      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  return { dueDate, daysLeft, overdue, label };
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
