import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { getBrand } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getBrand();

  return (
    <div className="flex min-h-screen flex-col bg-obsidian">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer brand={brand} />
    </div>
  );
}
