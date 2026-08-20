"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Phone, ArrowUpRight, Menu, X } from "lucide-react";
import { cn, publicPhoneDisplay, publicTelHref } from "@/lib/utils";

export interface NavbarProps {
  activeHref?: string;
}

const NAV_ITEMS = [
  { label: "Active Layouts", href: "/#ventures" },
  { label: "About Legacy", href: "/#legacy" },
  { label: "Proprietor", href: "/#proprietor" },
  { label: "Contact", href: "/#contact" },
];

/**
 * Responsive glassmorphic sticky public navbar.
 */
export function Navbar({ activeHref = "/" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const telHref = publicTelHref();
  const phoneLabel = publicPhoneDisplay();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-white/[0.09] bg-obsidian/95 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 shrink-0 flex-col gap-0.5">
          <span className="gold-text font-display truncate text-base font-extrabold tracking-tight sm:text-xl">
            Sri Sai Real Estates
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.1em] text-white/45 sm:block sm:text-[10.5px]">
            EST. 1980 · 40+ YEARS OF TRUST
          </span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <nav className="glass flex gap-0.5 rounded-full p-1.5">
            {NAV_ITEMS.map((item, i) => {
              const active =
                (activeHref === "/" && i === 0) || activeHref === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-[7px] font-display text-[13px] font-semibold transition xl:px-[18px]",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <a
            href={telHref}
            className="btn-gold hidden items-center gap-2 rounded-full px-4 py-2 text-[12px] md:inline-flex lg:px-[22px] lg:py-[9px] lg:text-[13px]"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{phoneLabel || "Call"}</span>
            <span className="lg:hidden">Call</span>
          </a>
          <Link
            href="/admin/dashboard"
            className="hidden items-center gap-1.5 rounded-full border border-white/25 px-3 py-2 font-display text-[12px] font-semibold text-white transition hover:bg-white/10 sm:inline-flex lg:px-5 lg:text-[13px]"
          >
            Admin
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-pearl lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/[0.07] bg-obsidian/98 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-display text-sm font-semibold text-[#8B97AD] hover:bg-gold/10 hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={telHref}
              className="btn-gold mt-2 flex items-center justify-center gap-2 rounded-xl py-3 text-sm"
            >
              <Phone className="h-4 w-4" />
              {phoneLabel || "Call"}
            </a>
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/25 py-3 font-display text-sm font-semibold text-white"
            >
              Admin Portal
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
