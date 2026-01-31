import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PTPN OneAccess | Enterprise Digital Gateway",
  description: "Gerbang Digital Terintegrasi PTPN Group. Akses aman dan terpusat untuk seluruh ekosistem aplikasi PTPN.",
  applicationName: "OneAccess",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OneAccess",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased selection:bg-emerald-500/30 selection:text-emerald-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
