"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Building2, ClipboardCheck, FileBarChart, FileText, LayoutDashboard, Moon, Receipt, Repeat, Settings, ShieldCheck, Sun, Truck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems: Array<{ label: string; href: string; Icon: LucideIcon }> = [
  { label: "Dashboard", href: "/", Icon: LayoutDashboard },
  { label: "Vendor Management", href: "/#vendors", Icon: Building2 },
  { label: "Purchase Requests", href: "/#purchase-requests", Icon: ClipboardCheck },
  { label: "Purchase Orders", href: "/#purchase-orders", Icon: FileText },
  { label: "Purchase Receipts", href: "/#receipts", Icon: Truck },
  { label: "Bills", href: "/#bills", Icon: Receipt },
  { label: "Recurring Bills", href: "/#recurring", Icon: Repeat },
  { label: "Reports", href: "/#reports", Icon: FileBarChart },
  { label: "Finance Dashboard", href: "/finance", Icon: BarChart3 },
  { label: "Founder Dashboard", href: "/founder", Icon: ShieldCheck },
  { label: "Settings", href: "/settings", Icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  onNewPurchaseRequest?: () => void;
};

export function AppShell({ children, darkMode = false, onToggleTheme, onNewPurchaseRequest }: AppShellProps) {
  const [fallbackDarkMode, setFallbackDarkMode] = useState(false);
  const activeDarkMode = onToggleTheme ? darkMode : fallbackDarkMode;
  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
      return;
    }
    setFallbackDarkMode((current) => {
      document.documentElement.classList.toggle("dark", !current);
      return !current;
    });
  };
  const startPurchaseRequest = () => {
    if (onNewPurchaseRequest) {
      onNewPurchaseRequest();
      return;
    }
    window.location.href = "/#purchase-requests";
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-card p-4 lg:block">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Bower School</p>
            <p className="text-xs text-muted-foreground">Procurement Control Tower</p>
          </div>
        </div>
        <nav className="grid gap-1">
          {navItems.map(({ label, href, Icon }) => (
            <Button key={label} asChild variant="ghost" className="justify-start">
              <Link href={href}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Finance controlled procurement</p>
              <h1 className="text-xl font-bold md:text-2xl">Procurement & Vendor Payables Management Portal</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={toggleTheme}>
                {activeDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {activeDarkMode ? "Light Mode" : "Dark Mode"}
              </Button>
              <Button onClick={startPurchaseRequest}>New Purchase Request</Button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
