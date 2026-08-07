"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-6 py-24">
      <h2 className="font-display text-xl font-extrabold text-pearl">
        Something went wrong
      </h2>
      <p className="text-sm text-[#8B97AD]">
        {error.message || "We couldn’t load this page. Please try again."}
      </p>
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
