import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { BrandSettings } from "@/types/database";

export interface FooterProps {
  companyName?: string;
  brand?: BrandSettings | null;
}

/**
 * Responsive public footer — contact from brand CMS when available.
 */
export function Footer({
  companyName = "Sri Sai Real Estates",
  brand,
}: FooterProps) {
  const year = new Date().getFullYear();
  const phone = brand?.contactPhone || "+91 98765 43210";
  const email = brand?.contactEmail || "info@srisairealestates.in";
  const address = brand?.officeAddress || "Ongole, Andhra Pradesh";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer
      id="contact"
      className="mt-auto border-t border-white/[0.07] px-4 py-8 sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center sm:gap-5">
        <div>
          <div className="gold-text font-display text-lg font-extrabold">
            {companyName}
          </div>
          <p className="mt-1 text-xs text-[#5C6B82]">
            © {year} {companyName}. All rights reserved.
            {brand?.legacyYears ? ` Est. legacy ${brand.legacyYears}+ years.` : ""}
          </p>
          <p className="mt-2 text-xs text-[#8B97AD]">
            Proprietor:{" "}
            <span className="font-medium text-pearl">Kotte Venkateswarlu</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 text-[13px] text-[#5C6B82] sm:flex-row sm:flex-wrap sm:gap-7">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {address}
          </span>
          <a
            href={telHref}
            className="inline-flex items-center gap-1.5 hover:text-gold"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" /> {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 hover:text-gold"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
          </a>
          <Link href="/admin/login" className="hover:text-gold">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
