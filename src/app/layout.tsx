import type { Metadata } from "next";
import { DM_Mono, Figtree, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Sri Sai Real Estates",
    template: "%s · Sri Sai Real Estates",
  },
  description:
    "Interactive venture layouts, live plot availability, and executive analytics for premium land ventures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} min-h-screen bg-obsidian font-sans text-pearl antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
