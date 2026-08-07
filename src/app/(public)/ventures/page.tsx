import Link from "next/link";
import { MOCK_VENTURES } from "@/lib/mock-data";

/** Venture index so /ventures is not a bare 404 */
export default function VenturesIndexPage() {
  const active = MOCK_VENTURES.filter((v) => v.status === "active");

  return (
    <div className="mx-auto max-w-3xl px-6 py-28">
      <p className="section-label mb-3">Venture Explorer</p>
      <h1 className="font-display mb-6 text-3xl font-extrabold text-pearl">
        Active layouts
      </h1>
      <ul className="space-y-3">
        {active.map((v) => (
          <li key={v.id}>
            <Link
              href={`/ventures/${v.slug}`}
              className="block rounded-xl border border-white/10 bg-midnight px-5 py-4 transition hover:border-gold/30"
            >
              <span className="font-display font-bold text-pearl">{v.name}</span>
              <span className="mt-1 block text-sm text-[#8B97AD]">
                {v.location}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
