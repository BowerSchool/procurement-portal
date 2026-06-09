import Link from "next/link";
import { BarChart3, Building2, ClipboardCheck, FileBarChart, FileText, LayoutDashboard, Receipt, Repeat, Settings, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
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

export function AppShell({ children }: { children: React.ReactNode }) {
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
              <Button variant="outline">Light/Dark Mode</Button>
              <Button>New Purchase Request</Button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
