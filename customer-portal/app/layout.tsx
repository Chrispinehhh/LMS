// customer-portal/app/layout.tsx

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import React from "react";
import Header from "@/components/Header"; // <-- Import the new Header
import Footer from "@/components/Footer"; // <-- Import the new Footer

const manrope = Manrope({ 
  subsets: ["latin"], 
  display: "swap",
  weight: ['400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: "LogiPro | Premium Logistics Services",
  description: "Seamless, reliable, and professional moving and delivery solutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <div className="flex flex-col min-h-screen">
          
          <Header /> {/* <-- Use the Header component */}

          <main className="flex-grow">
            {children}
          </main>

          <Footer /> {/* <-- Use the Footer component */}

        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}