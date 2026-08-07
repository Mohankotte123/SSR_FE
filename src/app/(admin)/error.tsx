"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex max-w-lg flex-col items-start gap-4">
      <h2 className="font-display text-xl font-extrabold text-pearl">
        Admin error
      </h2>
      <p className="text-sm text-[#8B97AD]">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="btn-gold rounded-xl px-5 py-2.5 text-sm"
      >
        Try again
      </button>
    </div>
  );
}
