import Link from "next/link";
import { listVentures } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Venture index so /ventures is not a bare 404 */
export default async function VenturesIndexPage() {
  const ventures = await listVentures();

  return (
    <div className="mx-auto max-w-3xl px-6 py-28">
      <p className="section-label mb-3">Venture Explorer</p>
      <h1 className="font-display mb-6 text-3xl font-extrabold text-pearl">
        Active layouts
      </h1>
      {ventures.length === 0 ? (
        <p className="text-sm text-[#8B97AD]">No ventures available yet.</p>
      ) : (
        <ul className="space-y-3">
          {ventures.map((v) => (
            <li key={v.id}>
              <Link
                href={`/ventures/${v.slug}`}
                className="block rounded-xl border border-white/10 bg-midnight px-5 py-4 transition hover:border-gold/30"
              >
                <span className="font-display font-bold text-pearl">
                  {v.title}
                </span>
                <span className="mt-1 block text-sm text-[#8B97AD]">
                  {v.location}
                  {typeof v.availablePlots === "number"
                    ? ` · ${v.availablePlots} available`
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
