export interface ProprietorSectionProps {
  name?: string;
  title?: string;
  bio?: string;
  imageSrc?: string;
}

/**
 * Proprietor / founder spotlight — placeholder portrait for later swap.
 */
export function ProprietorSection({
  name = "Kotte Venkateswarlu",
  title = "Proprietor · Sri Sai Real Estates",
  bio = "Guiding Sri Sai Real Estates with a commitment to transparent dealings.",
  imageSrc = "/Home/88706.jpg",
}: ProprietorSectionProps) {
  return (
    <section
      id="proprietor"
      className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-midnight via-midnight to-[#1a2438] sm:rounded-3xl">
        <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(183,165,137,0.12)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(90,120,160,0.1)_0%,transparent_70%)]" />

        <div className="relative flex flex-col items-center gap-6 px-5 py-10 text-center sm:flex-row sm:gap-8 sm:px-10 sm:py-12 sm:text-left lg:gap-10 lg:px-14">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-white/25 via-white/5 to-transparent opacity-80" />
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/25 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={name}
                className="h-full w-full object-cover object-[center_20%]"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="section-label mb-2">Leadership</p>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-pearl sm:text-3xl">
              {name}
            </h2>
            <p className="mt-1.5 font-display text-sm font-semibold text-gold sm:text-[15px]">
              {title}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#8B97AD] sm:mx-0 sm:text-[15px]">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
