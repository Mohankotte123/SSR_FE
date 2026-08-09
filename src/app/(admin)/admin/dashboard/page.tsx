import type { Metadata } from "next";
import { DashboardClient } from "@/components/admin/DashboardClient";
import { listVentures } from "@/lib/api";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const ventures = await listVentures();
  return <DashboardClient ventures={ventures} />;
}
