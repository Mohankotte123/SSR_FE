import type { Metadata } from "next";
import {
  Building2,
  Landmark,
  ShieldCheck,
  Map,
  Gem,
  ScrollText,
} from "lucide-react";
import { Hero } from "@/components/public/Hero";
import { VentureCard } from "@/components/public/VentureCard";
import { ProprietorSection } from "@/components/public/ProprietorSection";
import { MOCK_VENTURES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Premium Land Ventures",
  description: "Browse active real estate ventures and interactive site layouts.",
};

const STATS = [
  {
    num: "40+",
    label: "Years of Market Legacy",
    sub: "Est. 1980, Ongole HQ",
    icon: Landmark,
  },
  {
    num: "25+",
    label: "Completed Ventures",
    sub: "Across Andhra Pradesh",
    icon: Building2,
  },
  {
    num: "1,200+",
    label: "Happy Plot Owners",
    sub: "Families who trusted us",
    icon: ShieldCheck,
  },
  {
    num: "₹150Cr+",
    label: "Total Land Value Sold",
    sub: "DTCP & RERA certified",
    icon: Gem,
  },
];

const WHY = [
  { icon: ShieldCheck, t: "DTCP & RERA", s: "All ventures legally approved" },
  { icon: Map, t: "Live SVG Maps", s: "Real-time plot availability" },
  { icon: Gem, t: "Zero Hidden Costs", s: "Transparent pricing always" },
  { icon: ScrollText, t: "Clear Title Deeds", s: "Legal due diligence done" },
];

export default function LandingPage() {
  const active = MOCK_VENTURES.filter((v) => v.status === "active");
  const availablePlots = active.reduce((sum, v) => sum + v.available_plots, 0);

  return (
    <>
      <Hero activeVentures={active.length} availablePlots={availablePlots} />

      <section className="relative z-10 -mt-2 px-4 sm:px-6 lg:px-10">
        <div className="glass mx-auto grid max-w-[1120px] grid-cols-2 overflow-hidden rounded-2xl border-t border-gold/15 shadow-[0_-4px_60px_rgba(0,0,0,0.45)] sm:rounded-[22px] md:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className={`flex flex-col gap-1.5 px-4 py-6 sm:px-6 sm:py-9 lg:px-8 ${
                  i < 3 ? "md:border-r md:border-white/[0.07]" : ""
                } ${i % 2 === 0 ? "border-r border-white/[0.07] md:border-r-0" : ""} ${
                  i < 2 ? "border-b border-white/[0.07] md:border-b-0" : ""
                }`}
              >
                <Icon className="mb-1 h-5 w-5 text-gold sm:h-6 sm:w-6" />
                <div className="gold-text font-display text-2xl font-extrabold leading-none tracking-tight sm:text-[34px]">
                  {s.num}
                </div>
                <div className="font-display text-xs font-bold text-pearl sm:text-sm">
                  {s.label}
                </div>
                <div className="text-[11px] text-[#5C6B82] sm:text-xs">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="ventures"
        className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-[100px]"
      >
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-3">Active Portfolio · 2026</p>
            <h2 className="font-display text-[clamp(26px,3.5vw,48px)] font-extrabold tracking-tight text-pearl">
              Live Venture Catalog
            </h2>
            <p className="mt-2.5 max-w-[460px] text-sm text-[#8B97AD] sm:text-[15px]">
              Every venture is DTCP or RERA approved. Prices and availability
              update in real-time.
            </p>
          </div>
          <p className="w-fit rounded-xl border border-gold/20 bg-gold/10 px-4 py-2 font-display text-xs font-bold text-gold sm:px-6 sm:py-2.5 sm:text-[13px]">
            {active.length} live ventures
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {active.map((venture) => (
            <VentureCard key={venture.id} venture={venture} />
          ))}
        </div>
      </section>

      <section
        id="legacy"
        className="mx-auto max-w-[1200px] px-4 pb-14 sm:px-8 sm:pb-16 lg:px-10"
      >
        <div className="grid items-center gap-8 rounded-2xl border border-gold/15 bg-gradient-to-br from-midnight to-[#1a2438] px-5 py-10 sm:gap-12 sm:rounded-3xl sm:px-10 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-16 lg:py-[60px]">
          <div>
            <p className="section-label mb-4">Why Sri Sai Real Estates</p>
            <h2 className="font-display mb-4 text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight text-pearl sm:mb-5">
              Built on Four Decades of Transparency
            </h2>
            <p className="text-sm leading-relaxed text-[#8B97AD] sm:text-[15px]">
              Since 1980, every plot we&apos;ve sold has been DTCP or RERA
              approved. We pioneered interactive digital layout maps in AP, so
              buyers always know exactly what they&apos;re purchasing — no
              surprises.
            </p>
            <a
              href="#contact"
              className="btn-gold mt-6 inline-flex rounded-xl px-6 py-3 text-sm sm:mt-8 sm:px-7 sm:py-3.5"
            >
              Our Full Legacy →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {WHY.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.t}
                  className="rounded-[14px] border border-white/[0.08] bg-obsidian/40 px-3.5 py-4 sm:px-[18px] sm:py-5"
                >
                  <Icon className="mb-2 h-4 w-4 text-gold sm:mb-2.5 sm:h-5 sm:w-5" />
                  <div className="font-display mb-1 text-xs font-bold text-pearl sm:text-sm">
                    {item.t}
                  </div>
                  <div className="text-[11px] text-[#5C6B82] sm:text-xs">
                    {item.s}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProprietorSection />
    </>
  );
}
