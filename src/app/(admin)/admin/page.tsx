import { redirect } from "next/navigation";

/** Convenience entry — admin lives under /admin/dashboard */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
