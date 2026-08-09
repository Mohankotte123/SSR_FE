"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateBrand } from "@/lib/api";
import type { BrandSettings } from "@/types/database";

export function BrandEditorForm({ initial }: { initial: BrandSettings }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    legacyYears: String(initial.legacyYears ?? 40),
    completedProjectsCount: String(initial.completedProjectsCount ?? 25),
    happyCustomersCount: String(initial.happyCustomersCount ?? 1000),
    contactPhone: initial.contactPhone ?? "",
    contactEmail: initial.contactEmail ?? "",
    officeAddress: initial.officeAddress ?? "",
    proprietorMessage: initial.proprietorMessage ?? "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await updateBrand({
        legacyYears: Number(form.legacyYears) || 0,
        completedProjectsCount: Number(form.completedProjectsCount) || 0,
        happyCustomersCount: Number(form.happyCustomersCount) || 0,
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
        officeAddress: form.officeAddress.trim(),
        proprietorMessage: form.proprietorMessage.trim() || null,
      });
      setMessage("Brand settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brand");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-midnight p-6"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Legacy years"
          value={form.legacyYears}
          onChange={(e) => setForm((f) => ({ ...f, legacyYears: e.target.value }))}
        />
        <Input
          label="Completed projects"
          value={form.completedProjectsCount}
          onChange={(e) =>
            setForm((f) => ({ ...f, completedProjectsCount: e.target.value }))
          }
        />
        <Input
          label="Happy customers"
          value={form.happyCustomersCount}
          onChange={(e) =>
            setForm((f) => ({ ...f, happyCustomersCount: e.target.value }))
          }
        />
      </div>
      <Input
        label="Contact phone"
        value={form.contactPhone}
        onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
      />
      <Input
        label="Contact email"
        type="email"
        value={form.contactEmail}
        onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
      />
      <Input
        label="Office address"
        value={form.officeAddress}
        onChange={(e) =>
          setForm((f) => ({ ...f, officeAddress: e.target.value }))
        }
      />
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
          Proprietor message
        </label>
        <textarea
          rows={4}
          value={form.proprietorMessage}
          onChange={(e) =>
            setForm((f) => ({ ...f, proprietorMessage: e.target.value }))
          }
          className="w-full resize-y rounded-[11px] border border-white/10 bg-obsidian/50 px-4 py-3 text-sm text-pearl outline-none focus:border-gold/40"
        />
      </div>
      {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
      {message ? <p className="text-sm text-plot-available">{message}</p> : null}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Saving…" : "Save brand settings"}
      </Button>
    </form>
  );
}
