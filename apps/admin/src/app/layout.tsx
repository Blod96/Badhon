import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminGuard } from "@/components/AdminGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Admin Console | Badhon (NWU Blood Connect)",
  description: "Protected administrative console for North Western University Blood Connect platform.",
  robots: "noindex, nofollow"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A"
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex bg-admin-surface text-text-primary antialiased font-sans">
        <AdminAuthProvider>
          <AdminGuard>
            <div className="flex w-full min-h-screen">
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
              </div>
            </div>
          </AdminGuard>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
