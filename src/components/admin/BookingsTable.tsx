"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { listBookings } from "@/lib/api";
import { formatCurrency, formatNumber, num } from "@/lib/utils";
import type { Booking, Pagination } from "@/types/database";

export function BookingsTable() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listBookings({ search: query || undefined, page, limit: 20 });
    if (!result.success) {
      setError(result.error);
      setItems([]);
      setPagination(null);
    } else {
      setItems(result.data.items);
      setPagination(result.data.pagination);
    }
    setLoading(false);
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search.trim());
        }}
      >
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6B82]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="h-11 w-full rounded-[11px] border border-white/10 bg-obsidian/50 pl-10 pr-4 text-sm text-pearl outline-none focus:border-gold/40"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-midnight">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-[#5C6B82]">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Venture / Plot</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Advance</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-[#5C6B82]">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-[#5C6B82]">
                  No bookings found.
                </td>
              </tr>
            ) : (
              items.map((b) => (
                <tr key={b.id} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-pearl">{b.customerName}</div>
                    <div className="text-xs text-[#5C6B82]">{b.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-[#8B97AD]">
                    {b.plot?.venture?.title ?? "—"} · Plot #
                    {b.plot?.plotNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-pearl">
                    {formatCurrency(num(b.totalAmount))}
                  </td>
                  <td className="px-4 py-3 font-mono text-gold">
                    {formatCurrency(num(b.advancePaid))}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5C6B82]">
                    {new Date(b.bookingDate).toLocaleDateString("en-IN")}
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
