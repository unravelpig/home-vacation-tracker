import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Vacation Tracker - Plan your trips",
  description: "A creative place to brainstorm and plan your vacations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <SidebarProvider>
          <Header />
          {/* Sidebar (mobile drawer) */}
          <Sidebar />
          {/* Scrollable content area — only this scrolls */}
          <main className="main-scroll">
            <div className="pt-14 lg:pl-64">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
