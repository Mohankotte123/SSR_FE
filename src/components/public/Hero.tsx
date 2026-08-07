import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  availablePlots?: number;
  activeVentures?: number;
}

/**
 * Figma HomePage hero — restored layout, Tailwind + Lucide.
 */
export function Hero({
  title,
  subtitle = "Explore interactive vector plot layouts, live availability status, and transparent real-time pricing — all in one place.",
  ctaHref = "#ventures",
  ctaLabel = "Explore Active Ventures",
  availablePlots = 0,
  activeVentures = 0,
}: HeroProps) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* BG image */}
      <div
        className="absolute inset-0 bg-cover bg-[center_40%]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?w=1800&h=1000&fit=crop&auto=format)",
        }}
      />
      {/* Multi-layer overlay (Figma) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,15,29,0.97) 0%, rgba(10,15,29,0.80) 50%, rgba(30,38,64,0.85) 100%)",
        }}
      />
      {/* Gold radial accent */}
      <div
        className="pointer-events-none absolute right-[8%] top-[15%] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 68%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-5%] left-[-5%] h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,200,83,0.05) 0%, transparent 65%)",
        }}
      />
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-20 pt-28 sm:px-10 sm:pt-[120px] lg:px-20">
        {/* Eyebrow */}
        <div className="glass mb-8 inline-flex animate-fade-up items-center gap-2.5 rounded-full px-[18px] py-2">
          <span className="dot-available animate-pulse-dot" />
          <span className="font-mono text-[11px] tracking-[0.12em] text-[#00C853]">
            DTCP & RERA APPROVED VENTURES · LIVE AVAILABILITY
          </span>
        </div>

        {/* Headline */}
        <h1
          className={cn(
            "font-display mb-7 max-w-[820px] animate-fade-up text-[clamp(40px,5.5vw,76px)] font-extrabold leading-[1.06] tracking-[-0.035em] text-[#F4F6F9]",
            "[animation-delay:80ms]"
          )}
        >
          {title ? (
            title
          ) : (
            <>
              40 Years of Legacy.
              <br />
              <span className="gold-text">Premium Land Ventures</span>
              <br />
              Redefined.
            </>
          )}
        </h1>

        <p
          className={cn(
            "mb-12 max-w-[560px] animate-fade-up text-lg leading-relaxed text-[#94A3C0]",
            "[animation-delay:160ms]"
          )}
        >
          {subtitle}
        </p>

        {/* CTAs */}
        <div
          className={cn(
            "flex animate-fade-up flex-wrap gap-4",
            "[animation-delay:240ms]"
          )}
        >
          <Link
            href={ctaHref}
            className="btn-gold inline-flex items-center gap-2 rounded-[14px] px-9 py-4 text-[15px]"
          >
            {ctaLabel}
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="#contact"
            className="glass inline-flex items-center gap-2 rounded-[14px] border border-[#F4F6F9]/20 bg-[#F4F6F9]/[0.06] px-9 py-4 font-display text-[15px] font-semibold text-[#F4F6F9] transition hover:border-[#D4AF37]/35"
          >
            <CalendarDays className="h-4 w-4" />
            Schedule Site Visit
          </Link>
        </div>

        {/* Floating venture preview card */}
        <div
          className={cn(
            "glass mt-14 inline-flex animate-fade-up items-center gap-4 rounded-[14px] px-5 py-3.5",
            "[animation-delay:360ms]"
          )}
        >
          <div className="flex">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0F1D]/80 text-sm"
                style={{
                  background: `hsl(${220 + i * 20},40%,22%)`,
                  marginLeft: i > 0 ? -8 : 0,
                }}
              />
            ))}
          </div>
          <div>
            <div className="font-display text-[13px] font-bold text-[#F4F6F9]">
              {activeVentures || 3} Active Ventures · {availablePlots || 20}{" "}
              Plots Available
            </div>
            <div className="mt-0.5 text-xs text-[#94A3C0]">
              Next site visit: Mon, 11 Aug 2026 · 10:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5">
        <div className="font-mono text-[11px] tracking-[0.1em] text-[#5A6A88]">
          SCROLL
        </div>
        <div
          className="h-10 w-px"
          style={{
            background:
              "linear-gradient(to bottom, rgba(212,175,55,0.5), transparent)",
          }}
        />
      </div>
    </section>
  );
}
