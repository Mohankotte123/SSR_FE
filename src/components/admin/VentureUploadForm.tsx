"use client";

import { useState, type DragEvent, type FormEvent } from "react";
import { FileUp, CheckCircle2, Trash2, Compass } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * SVG venture onboarding form with drag-and-drop (UI-only, no API).
 */
export function VentureUploadForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [approvalType, setApprovalType] = useState("DTCP");

  function acceptFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".svg") && f.type !== "image/svg+xml") {
      setError("Only SVG files are accepted.");
      return;
    }
    setError(null);
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    acceptFile(f);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!file) {
      setError("Upload an SVG blueprint to continue.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    // Static UI demo — no backend call
    await new Promise((r) => setTimeout(r, 600));
    setMessage(
      `Demo only: “${String(new FormData(formEl).get("name") || "Venture")}” would be published here. API wiring comes later.`
    );
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="inline-flex rounded-[14px] border border-white/[0.08] bg-midnight p-1">
        {["1. Venture Details", "2. SVG Blueprint", "3. Review & Publish"].map(
          (step, i) => (
            <div
              key={step}
              className={cn(
                "rounded-[10px] px-[22px] py-2.5 font-display text-[12.5px] font-bold",
                i === 0 && "bg-gold/15 text-gold",
                i === 1 && file && "bg-plot-available/15 text-plot-available",
                i !== 0 && !(i === 1 && file) && "text-[#5C6B82]"
              )}
            >
              {step}
            </div>
          )
        )}
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-[18px] border border-white/[0.08] bg-midnight p-[26px]">
            <h3 className="font-display mb-5 text-[15px] font-bold text-pearl">
              Venture Information
            </h3>
            <div className="space-y-4">
              <Input
                name="name"
                label="Venture Title *"
                required
                placeholder="e.g. Grand Palms Phase III"
              />
              <Input
                name="slug"
                label="URL slug *"
                required
                placeholder="greenfield-heights"
                hint="Lowercase, hyphenated. Used in /ventures/[slug]."
              />
              <Input
                name="location"
                label="Location / Address *"
                placeholder="e.g. Ongole Bypass, Prakasam Dist."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                    Approval Type *
                  </p>
                  <div className="flex gap-1.5">
                    {["DTCP", "RERA", "Both"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setApprovalType(t)}
                        className={cn(
                          "flex-1 rounded-[9px] py-2.5 font-display text-xs font-bold transition",
                          approvalType === t
                            ? "border border-gold/35 bg-gold/20 text-gold"
                            : "border border-white/[0.08] bg-obsidian/40 text-[#5C6B82]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  name="approval_number"
                  label="Approval Number"
                  placeholder="e.g. 1042/2024"
                />
              </div>
              <Input
                name="description"
                label="Description"
                placeholder="Short overview"
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[18px] border border-white/[0.08] bg-midnight p-[26px]">
            <h3 className="font-display mb-1 text-[15px] font-bold text-pearl">
              SVG Blueprint Upload
            </h3>
            <p className="mb-5 text-[13px] text-[#5C6B82]">
              Upload CAD-exported SVG. System reads{" "}
              <code className="rounded bg-gold/10 px-1.5 py-0.5 font-mono text-xs text-gold">
                plot-*
              </code>{" "}
              IDs.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed px-7 py-[52px] text-center transition",
                dragging && "border-gold bg-gold/5",
                file && !dragging && "border-plot-available bg-plot-available/5",
                !file && !dragging && "border-white/15 bg-obsidian/30"
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {file ? (
                <div className="relative">
                  <CheckCircle2 className="mx-auto mb-3.5 h-12 w-12 text-plot-available" />
                  <p className="font-display text-base font-bold text-plot-available">
                    {file.name}
                  </p>
                  <p className="mt-1 text-[13px] text-[#5C6B82]">
                    {(file.size / 1024).toFixed(0)} KB · SVG vector layout
                  </p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-plot-sold/20 bg-plot-sold/10 px-4 py-1.5 font-display text-[11.5px] font-bold text-plot-sold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove & Re-upload
                  </button>
                </div>
              ) : (
                <label className="relative block cursor-pointer">
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
                  />
                  <FileUp className="mx-auto mb-3.5 h-12 w-12 text-[#8B97AD]/50" />
                  <p className="font-display text-[15px] font-bold text-[#8B97AD]">
                    {dragging
                      ? "Drop SVG here…"
                      : "Drag & drop your CAD SVG file"}
                  </p>
                  <p className="mt-2 text-[13px] text-[#5C6B82]">
                    or click to browse files
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Badge tone="neutral">SVG only</Badge>
                    <Badge tone="neutral">Max 10 MB</Badge>
                    <Badge tone="neutral">AutoCAD / QGIS</Badge>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gold/15 bg-gold/[0.04] px-6 py-5">
            <div className="mb-3.5 flex items-center gap-2 font-display text-sm font-bold text-gold">
              <Compass className="h-4 w-4" />
              SVG Blueprint Guide
            </div>
            {[
              "Export SVG from AutoCAD, QGIS, or any CAD tool",
              'Name each plot path with id="plot-101", "plot-102" etc.',
              "System reads polygon shapes and assigns inventory rows",
              "Road labels and park areas are ignored automatically",
            ].map((tip, i) => (
              <div
                key={tip}
                className="mb-2 flex gap-2.5 text-[13px] leading-relaxed text-[#8B97AD]"
              >
                <span className="shrink-0 font-mono text-[11px] text-gold/55">
                  0{i + 1}
                </span>
                {tip}
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
          {message ? (
            <p className="text-sm text-plot-available">{message}</p>
          ) : null}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full rounded-[14px]"
            disabled={pending || !file}
          >
            {pending
              ? "Publishing…"
              : "Publish Venture & Interactive Layout →"}
          </Button>
          {!file ? (
            <p className="text-center text-xs text-slate-light">
              Upload SVG blueprint to enable publishing
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
