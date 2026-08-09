"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { listLeads, listVentures } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import type { Lead, Pagination, Venture } from "@/types/database";

export function LeadsTable() {
  const [ventureId, setVentureId] = useState("");
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listVentures().then(setVentures);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listLeads({
      ventureId: ventureId || undefined,
      page,
      limit: 20,
    });
    if (!result.success) {
      setError(result.error);
      setItems([]);
      setPagination(null);
    } else {
      setItems(result.data.items);
      setPagination(result.data.pagination);
    }
    setLoading(false);
  }, [page, ventureId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={ventureId}
          onChange={(e) => {
            setPage(1);
            setVentureId(e.target.value);
          }}
          className="h-11 rounded-[11px] border border-white/10 bg-obsidian/50 px-3 text-sm text-pearl outline-none focus:border-gold/40"
        >
          <option value="">All ventures</option>
          {ventures.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-midnight">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-[#5C6B82]">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Venture / Plot</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-[#5C6B82]">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-[#5C6B82]">
                  No leads found.
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-pearl">{l.name}</div>
                    <div className="text-xs text-[#5C6B82]">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-[#8B97AD]">
                    {l.venture?.title ?? "—"}
                    {l.plotNumber ? ` · Plot #${l.plotNumber}` : ""}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-[#8B97AD]">
                    {l.message || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5C6B82]">
                    {new Date(l.createdAt).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between text-sm text-[#8B97AD]">
          <span>
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {formatNumber(pagination.total)} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
