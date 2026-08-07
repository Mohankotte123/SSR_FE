import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
