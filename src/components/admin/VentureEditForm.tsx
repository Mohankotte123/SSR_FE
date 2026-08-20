"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateVenture } from "@/lib/api";
import type { Venture } from "@/types/database";

export function VentureEditForm({ venture }: { venture: Venture }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = new FormData();
    const fields = [
      "title",
      "location",
      "description",
      "googleMapsUrl",
      "youtubeVideoUrl",
      "dtcpReraNumber",
    ] as const;
    fields.forEach((key) => {
      body.set(key, String(form.get(key) || "").trim());
    });
    if (cover) body.set("coverImage", cover);
    if (brochure) body.set("brochure", brochure);

    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateVenture(venture.slug || venture.id, body);
      setMessage(`Saved “${updated.title}”.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-midnight p-6"
    >
      <Input
        name="title"
        label="Title"
        defaultValue={venture.title}
        required
      />
      <Input
        name="location"
        label="Location"
        defaultValue={venture.location}
        required
      />
      <Input
        name="description"
        label="Description"
        defaultValue={venture.description ?? ""}
      />
      <Input
        name="dtcpReraNumber"
        label="DTCP / RERA"
        defaultValue={venture.dtcpReraNumber ?? ""}
      />
      <Input
        name="googleMapsUrl"
        label="Google Maps coordinates"
        placeholder="15.524404, 80.024833"
        defaultValue={venture.googleMapsUrl ?? ""}
      />
      <Input
        name="youtubeVideoUrl"
        label="YouTube URL"
        defaultValue={venture.youtubeVideoUrl ?? ""}
      />
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
          Cover image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          className="text-sm text-[#8B97AD]"
        />
        {venture.coverImageUrl ? (
          <p className="mt-1 text-xs text-[#5C6B82]">
            Current:{" "}
            <a
              href={venture.coverImageUrl}
              className="text-gold hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              view
            </a>
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
          Brochure PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setBrochure(e.target.files?.[0] ?? null)}
          className="text-sm text-[#8B97AD]"
        />
        {venture.brochurePdfUrl ? (
          <p className="mt-1 text-xs text-[#5C6B82]">
            Current:{" "}
            <a
              href={venture.brochurePdfUrl}
              className="text-gold hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              download
            </a>
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
      {message ? <p className="text-sm text-plot-available">{message}</p> : null}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
