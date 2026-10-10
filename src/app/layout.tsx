import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: { default: "CV Builder", template: "%s · CV Builder" },
  description: "Buat, atur, dan ekspor CV profesional dengan pratinjau langsung.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${dmSans.variable} ${jakarta.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
