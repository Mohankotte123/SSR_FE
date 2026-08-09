import type { Metadata } from "next";
import { VentureAnalyticsClient } from "@/components/admin/VentureAnalyticsClient";
import { listVentures } from "@/lib/api";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

async function resolveParams(
  params: AnalyticsPageProps["params"]
): Promise<{ id: string }> {
  return await Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: AnalyticsPageProps): Promise<Metadata> {
  const { id } = await resolveParams(params);
  return { title: `Analytics · ${id}` };
}

export default async function VentureAnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id } = await resolveParams(params);
  const ventures = await listVentures();
  return <VentureAnalyticsClient id={id} ventures={ventures} />;
}
