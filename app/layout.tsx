import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bower Procurement & Vendor Payables",
  description: "Finance-controlled procurement, vendor master, PO, invoice, payment and liability portal."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
