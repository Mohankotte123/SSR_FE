import Link from "next/link";

export default function VentureNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-6 py-28">
      <h2 className="font-display text-xl font-extrabold text-pearl">
        Venture not found
      </h2>
      <p className="text-sm text-[#8B97AD]">
        This venture may have been archived or the URL is incorrect.
      </p>
      <Link href="/" className="btn-gold inline-flex rounded-xl px-5 py-2.5 text-sm">
        Back to ventures
      </Link>
    </div>
  );
}
