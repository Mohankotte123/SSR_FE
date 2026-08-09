"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getMe } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

/**
 * Admin chrome + session restore via GET /api/auth/me.
 * Login route renders without sidebar.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(isLogin);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    void getMe(token).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setDenied(true);
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isLogin, pathname, router]);

  if (isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
        {children}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian text-sm text-[#8B97AD]">
        {denied ? "Redirecting to login…" : "Restoring admin session…"}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-obsidian lg:flex-row">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-[#0E1420]">
        <main className="ambient-surface flex-1 p-4 sm:p-6 lg:p-8 xl:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
