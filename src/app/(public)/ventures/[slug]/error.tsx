"use client";

export default function VentureError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-4 py-16">
      <h2 className="text-xl font-semibold text-neutral-900">Couldn’t load venture</h2>
      <p className="text-sm text-neutral-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="h-10 bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Try again
      </button>
    </div>
  );
}
