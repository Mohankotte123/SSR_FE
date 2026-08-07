"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Plus,
  Grid3x3,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  User,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface AdminSidebarProps {
  ventureId?: string;
}

/**
 * Responsive dark admin navigation.
 */
export function AdminSidebar({ ventureId }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    {
      href: "/admin/dashboard",
      label: "Executive Analytics",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/dashboard",
      label: "Ventures List",
      icon: BookOpen,
      key: "ventures-list",
    },
    ...(ventureId
      ? [
          {
            href: `/admin/ventures/${ventureId}/plots`,
            label: "Inventory Matrix",
            icon: Grid3x3,
          },
          {
            href: `/admin/ventures/${ventureId}/analytics`,
            label: "Venture Analytics",
            icon: BarChart3,
          },
        ]
      : [
          {
            href: "/admin/ventures/1/plots",
            label: "Inventory Matrix",
            icon: Grid3x3,
            key: "inventory-demo",
          },
          {
            href: "/admin/ventures/1/analytics",
            label: "Venture Analytics",
            icon: BarChart3,
            key: "analytics-demo",
          },
        ]),
    {
      href: "/admin/dashboard",
      label: "Leads",
      icon: MessageSquare,
      badge: "7",
      key: "leads",
    },
  ];

  const nav = (
    <>
      <div className="border-b border-white/[0.07] px-5 pb-[22px] pt-7">
        <div className="gold-text font-display text-lg font-extrabold tracking-tight">
          Sri Sai Real Estates
        </div>
        <div className="mt-2">
          <Badge tone="gold" className="text-[10px] tracking-wider">
            ADMIN PORTAL
          </Badge>
        </div>
        <div className="mt-3.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-gold/35 bg-gradient-to-br from-gold/30 to-gold/10">
            <User className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="font-display text-[12.5px] font-bold text-pearl">
              Super Admin
            </p>
            <p className="text-[11px] text-[#5C6B82]">Executive access</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3.5">
        <p className="mb-1.5 px-1.5 font-mono text-[10px] tracking-[0.12em] text-slate-light">
          NAVIGATION
        </p>
        {links.map((item) => {
          const Icon = item.icon;
          const key =
            "key" in item && item.key ? item.key : item.href + item.label;
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "mb-0.5 flex w-full items-center gap-2.5 rounded-xl border-l-2 px-3.5 py-2.5 font-display text-[13px] font-semibold transition",
                active
                  ? "border-gold bg-gradient-to-r from-gold/15 to-gold/[0.04] text-gold"
                  : "border-transparent text-[#8B97AD] hover:bg-gold/[0.07] hover:text-gold-light"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[10px] font-bold text-gold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div className="my-[18px] h-px bg-white/[0.06]" />
        <p className="mb-2 px-1.5 font-mono text-[10px] tracking-[0.12em] text-slate-light">
          ACTIONS
        </p>
        <Link
          href="/admin/ventures/new"
          onClick={() => setOpen(false)}
          className="btn-gold flex w-full items-center justify-center gap-1.5 rounded-[11px] py-2.5 text-[12.5px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Onboard New Venture
        </Link>
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-3.5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-light hover:bg-white/5 hover:text-[#8B97AD]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Public Site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.07] bg-obsidian/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <span className="gold-text font-display text-sm font-extrabold">
          Admin Console
        </span>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-pearl"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col overflow-y-auto border-r border-white/[0.07] bg-gradient-to-b from-obsidian to-[#0E1428] transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:w-[236px] lg:translate-x-0 lg:shrink-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {nav}
      </aside>
    </>
  );
}
