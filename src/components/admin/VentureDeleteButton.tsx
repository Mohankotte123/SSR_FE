"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteVenture } from "@/lib/api";

export interface VentureDeleteButtonProps {
  idOrSlug: string;
  title: string;
}

/**
 * Destructive venture delete with confirm — removes bookings, plots, leads, media.
 */
export function VentureDeleteButton({
  idOrSlug,
  title,
}: VentureDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete “${title}” permanently?\n\nThis removes all plots, bookings, leads, and uploaded layout files. This cannot be undone.`
    );
    if (!ok) return;

    setPending(true);
    setError(null);
    try {
      await deleteVenture(idOrSlug);
      router.push("/admin/ventures");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete venture");
      setPending(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="secondary"
        className="w-full border-plot-sold/30 bg-plot-sold/10 text-plot-sold hover:bg-plot-sold/20"
        disabled={pending}
        onClick={() => void handleDelete()}
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? "Deleting…" : "Delete venture"}
      </Button>
      {error ? <p className="text-xs text-plot-sold">{error}</p> : null}
    </div>
  );
}
